export const cx = (...cls: Array<string | false | undefined>) => cls.filter(Boolean).join(' ');
export const uid = () => Math.random().toString(36).slice(2, 10);

export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(id);
        reject(new DOMException('aborted', 'AbortError'));
      });
    }
  });
