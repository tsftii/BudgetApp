export function setupCounter(element: HTMLElement): void {
  let counter: number = 0;
  const setCounter = (count: number): void => {
    counter = count;
    element.innerHTML = `Count is ${counter}`;
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);
}
