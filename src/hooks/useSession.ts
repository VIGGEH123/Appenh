import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const SESSION_KEY = 'dopamine_session_id';
const SAVINGS_KEY = 'dopamine_total_saved';
const ORDERS_KEY = 'dopamine_orders_count';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  useEffect(() => {
    let stored = localStorage.getItem(SESSION_KEY);
    const saved = parseFloat(localStorage.getItem(SAVINGS_KEY) || '0');
    const count = parseInt(localStorage.getItem(ORDERS_KEY) || '0', 10);
    setTotalSaved(saved);
    setOrdersCount(count);

    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, stored);
    }
    setSessionId(stored);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('total_saved, orders_count')
          .eq('id', stored)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setTotalSaved(parseFloat(data.total_saved) || 0);
          setOrdersCount(data.orders_count || 0);
          localStorage.setItem(SAVINGS_KEY, String(data.total_saved || 0));
          localStorage.setItem(ORDERS_KEY, String(data.orders_count || 0));
        } else {
          const { error: insertError } = await supabase.from('sessions').insert({
            id: stored,
            total_saved: saved,
            orders_count: count,
          });
          if (insertError) throw insertError;
        }
      } catch {
        // Silently fall back to localStorage values already set above
      }
    })();
  }, []);

  const addSavings = useCallback(
    async (amount: number) => {
      if (!sessionId) return;
      const newTotal = totalSaved + amount;
      const newCount = ordersCount + 1;
      setTotalSaved(newTotal);
      setOrdersCount(newCount);
      localStorage.setItem(SAVINGS_KEY, String(newTotal));
      localStorage.setItem(ORDERS_KEY, String(newCount));
      try {
        await supabase
          .from('sessions')
          .update({ total_saved: newTotal, orders_count: newCount })
          .eq('id', sessionId);
      } catch {
        // localStorage already updated, DB sync is best-effort
      }
    },
    [sessionId, totalSaved, ordersCount],
  );

  const recordOrder = useCallback(
    async (orderData: {
      restaurantName: string;
      items: { name: string; price: number; quantity: number }[];
      subtotal: number;
      deliveryFee: number;
      total: number;
    }) => {
      if (!sessionId) return;
      try {
        await supabase.from('fake_orders').insert({
          session_id: sessionId,
          restaurant_name: orderData.restaurantName,
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
        });
      } catch {
        // Best-effort logging, don't crash the app
      }
    },
    [sessionId],
  );

  const resetSession = useCallback(async () => {
    setTotalSaved(0);
    setOrdersCount(0);
    localStorage.setItem(SAVINGS_KEY, '0');
    localStorage.setItem(ORDERS_KEY, '0');
    try {
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({ total_saved: 0, orders_count: 0 })
          .eq('id', sessionId);
      }
    } catch {
      // localStorage already reset
    }
  }, [sessionId]);

  return { sessionId, totalSaved, ordersCount, addSavings, recordOrder, resetSession };
}
