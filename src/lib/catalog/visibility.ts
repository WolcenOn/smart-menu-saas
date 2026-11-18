export type PublicDish = {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  availability: 'AVAILABLE' | 'SOLD_OUT';
  allergensReviewedAt: Date | null;
};

export function isDishPublic(dish: PublicDish): boolean {
  return dish.status === 'PUBLISHED' && dish.allergensReviewedAt !== null;
}

export function canSelectDish(dish: PublicDish): boolean {
  return isDishPublic(dish) && dish.availability === 'AVAILABLE';
}
