import { describe, it, expect, beforeEach } from 'vitest';
import { useStatusStore } from '../statusStore';
import { getDefaultConfig } from '../../utils/config';

describe('statusStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStatusStore.setState({
      currentInstance: 'primary',
      autoRefresh: false,
      config: null
    });
  });

  it('has correct initial state', () => {
    const store = useStatusStore.getState();

    expect(store.currentInstance).toBe('primary');
    expect(store.autoRefresh).toBe(false);
    expect(store.config).toBe(null);
  });

  it('updates current instance', () => {
    const { setCurrentInstance } = useStatusStore.getState();
    
    setCurrentInstance('analytics');
    
    const store = useStatusStore.getState();
    expect(store.currentInstance).toBe('analytics');
  });

  it('toggles auto refresh', () => {
    const { toggleAutoRefresh } = useStatusStore.getState();
    
    // Initially false
    expect(useStatusStore.getState().autoRefresh).toBe(false);
    
    // Toggle to true
    toggleAutoRefresh();
    expect(useStatusStore.getState().autoRefresh).toBe(true);
    
    // Toggle back to false
    toggleAutoRefresh();
    expect(useStatusStore.getState().autoRefresh).toBe(false);
  });

  it('sets config', () => {
    const { setConfig } = useStatusStore.getState();
    const testConfig = getDefaultConfig();
    
    setConfig(testConfig);
    
    const store = useStatusStore.getState();
    expect(store.config).toEqual(testConfig);
  });

  it('updates config without affecting other state', () => {
    const { setCurrentInstance, toggleAutoRefresh, setConfig } = useStatusStore.getState();
    
    // Set some initial state
    setCurrentInstance('analytics');
    toggleAutoRefresh();
    
    // Set config
    const testConfig = getDefaultConfig();
    setConfig(testConfig);
    
    const store = useStatusStore.getState();
    expect(store.currentInstance).toBe('analytics');
    expect(store.autoRefresh).toBe(true);
    expect(store.config).toEqual(testConfig);
  });

  it('allows multiple store subscriptions', () => {
    let callCount = 0;
    
    const unsubscribe1 = useStatusStore.subscribe(() => {
      callCount++;
    });
    
    const unsubscribe2 = useStatusStore.subscribe(() => {
      callCount++;
    });
    
    useStatusStore.getState().setCurrentInstance('payments');
    
    expect(callCount).toBe(2);
    
    unsubscribe1();
    unsubscribe2();
  });

  it('maintains state consistency across actions', () => {
    const { setCurrentInstance, toggleAutoRefresh, setConfig } = useStatusStore.getState();
    const testConfig = getDefaultConfig();
    
    // Perform multiple state updates
    setCurrentInstance('payments');
    setConfig(testConfig);
    toggleAutoRefresh();
    setCurrentInstance('analytics');
    
    const finalState = useStatusStore.getState();
    expect(finalState.currentInstance).toBe('analytics');
    expect(finalState.autoRefresh).toBe(true);
    expect(finalState.config).toEqual(testConfig);
  });
});