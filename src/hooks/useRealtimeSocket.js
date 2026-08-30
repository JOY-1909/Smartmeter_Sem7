import { useState, useEffect, useRef, useCallback } from 'react';
import { getNextMockTelemetry } from '../services/mockData';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live-metrics';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const REFRESH_RATE_MS = Number(import.meta.env.VITE_MOCK_REFRESH_RATE_MS) || 1000;

/**
 * useRealtimeSocket Hook
 * Connects to live WebSocket or falls back to physics-accurate mock stream.
 * 
 * Switching to real WebSocket in production:
 * - Just set VITE_USE_MOCK_DATA=false in your .env file
 * - The hook automatically manages WebSocket connection, subscriptions & auto-reconnect!
 */
export function useRealtimeSocket(onTelemetryReceived = null) {
  const [latestTelemetry, setLatestTelemetry] = useState(() => getNextMockTelemetry());
  const [isConnected, setIsConnected] = useState(true);
  const [connectionState, setConnectionState] = useState(USE_MOCK ? 'mock_active' : 'connecting');
  const [isPaused, setIsPaused] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const prevTelemetryRef = useRef(latestTelemetry);

  // Keep callback ref fresh without breaking effect dependencies
  const onTelemetryReceivedRef = useRef(onTelemetryReceived);
  useEffect(() => {
    onTelemetryReceivedRef.current = onTelemetryReceived;
  }, [onTelemetryReceived]);

  // Handle telemetry dispatch
  const handleNewReading = useCallback((data) => {
    prevTelemetryRef.current = data;
    setLatestTelemetry(data);
    if (onTelemetryReceivedRef.current) {
      onTelemetryReceivedRef.current(data);
    }
  }, []);

  // Anomaly trigger (e.g. inject overvoltage surge for testing)
  const triggerAnomaly = useCallback((anomalyType, durationMs = 6000) => {
    setActiveAnomaly(anomalyType);
    if (durationMs > 0) {
      setTimeout(() => {
        setActiveAnomaly(null);
      }, durationMs);
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // 1. Mock Mode Generator (setInterval)
  useEffect(() => {
    if (!USE_MOCK) return;

    setConnectionState('mock_active');
    setIsConnected(true);

    if (isPaused) return;

    const interval = setInterval(() => {
      const nextTick = getNextMockTelemetry(prevTelemetryRef.current, activeAnomaly);
      handleNewReading(nextTick);
    }, REFRESH_RATE_MS);

    return () => clearInterval(interval);
  }, [isPaused, activeAnomaly, handleNewReading]);

  // 2. Real WebSocket Client Implementation
  useEffect(() => {
    if (USE_MOCK) return;

    let isUnmounted = false;

    const connectWebSocket = () => {
      setConnectionState('connecting');
      try {
        // Single line real WebSocket instantiation
        const ws = new WebSocket(WS_URL);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          console.log('[GridSense WS] Connected to live telemetric stream:', WS_URL);
          setIsConnected(true);
          setConnectionState('connected');
        };

        ws.onmessage = (event) => {
          if (isUnmounted || isPaused) return;
          try {
            const parsed = JSON.parse(event.data);
            handleNewReading(parsed);
          } catch (err) {
            console.error('[GridSense WS] Error parsing telemetry payload:', err);
          }
        };

        ws.onerror = (err) => {
          console.warn('[GridSense WS] Connection error:', err);
          setIsConnected(false);
          setConnectionState('error');
        };

        ws.onclose = (event) => {
          if (isUnmounted) return;
          console.warn('[GridSense WS] Connection closed. Reconnecting in 3s...', event.reason);
          setIsConnected(false);
          setConnectionState('disconnected');
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };
      } catch (err) {
        console.error('[GridSense WS] Failed to initiate WebSocket:', err);
        setIsConnected(false);
        setConnectionState('disconnected');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isPaused, handleNewReading]);

  return {
    latestTelemetry,
    isConnected,
    connectionState,
    isPaused,
    togglePause,
    triggerAnomaly,
    activeAnomaly,
    isMock: USE_MOCK
  };
}
