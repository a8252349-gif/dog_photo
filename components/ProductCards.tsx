import { PRODUCT_OPTIONS } from "@/lib/site";
import type { FulfillmentType } from "@/lib/types";

const order: FulfillmentType[] = ["digital", "print", "frame"];

export function ProductCards() {
  return (
    <div className="product-grid">
      {order.map((key, index) => {
        const item = PRODUCT_OPTIONS[key];
        return (
          <article
            key={key}
            className={`product-card ${index === 0 ? "product-card--featured" : ""}`}
          >
            <span className="product-card__index">0{index + 1}</span>
            <h3>{item.label}</h3>
            <strong className="product-card__price">{item.priceLabel}</strong>
            <p>{item.description}</p>
            <ul>
              <li>반려동물 1마리 제작</li>
              <li>고해상도 5:7 JPG</li>
              <li>{key === "digital" ? "온라인 결과 제공" : "스마트스토어 배송지로 발송"}</li>
            </ul>
            <strong>{index === 0 ? "기본 상품" : "선택 옵션"}</strong>
          </article>
        );
      })}
    </div>
  );
}
