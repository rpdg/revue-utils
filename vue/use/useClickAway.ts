import { Ref, unref } from 'vue';
import { useEventListener } from './useEventListener';

export type UseClickAwayOptions = {
  eventName?: string;
};

/**
 * Triggers a callback when user clicks outside of the target element.
 * @param target Element | Ref<Element | undefined>
 * @param listener EventListener
 * @param options Options?
 */
export function useClickAway(
  target: Element | Ref<Element | undefined>,
  listener: EventListener,
  options: UseClickAwayOptions = {}
) {


  const { eventName = 'click' } = options;

  const onClick = (event: Event) => {
    const element = unref(target);
    if (element && !element.contains(event.target as Node)) {
      listener(event);
    }
  };

  useEventListener(eventName, onClick, { target: document });
}