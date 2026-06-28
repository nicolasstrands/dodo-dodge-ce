export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>): void {
    clearTimeout(timeout);

    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
