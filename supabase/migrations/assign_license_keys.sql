-- assign_license_keys RPC 함수
-- race condition 방지: FOR UPDATE SKIP LOCKED
-- 재고 부족 시 EXCEPTION 발생

CREATE OR REPLACE FUNCTION assign_license_keys(
  p_product_id UUID,
  p_quantity INTEGER,
  p_order_id UUID
)
RETURNS SETOF license_keys
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_count INTEGER;
  v_key RECORD;
  v_result license_keys[];
BEGIN
  -- 사용 가능한 키를 수량만큼 잠금 + 할당
  v_assigned_count := 0;

  FOR v_key IN
    SELECT *
    FROM license_keys
    WHERE product_id = p_product_id
      AND status = 'available'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_quantity
  LOOP
    UPDATE license_keys
    SET status = 'sold',
        order_id = p_order_id,
        sold_at = NOW(),
        updated_at = NOW()
    WHERE id = v_key.id;

    v_assigned_count := v_assigned_count + 1;

    RETURN NEXT v_key;
  END LOOP;

  -- 재고 부족 체크
  IF v_assigned_count < p_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: 상품(%)의 재고가 부족합니다. 요청: %, 가용: %',
      p_product_id, p_quantity, v_assigned_count;
  END IF;

  RETURN;
END;

$$;
