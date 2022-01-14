import { Ref, unref } from 'vue';
import { useEventListener } from './useEventListener';

export type UseClickAwayOptions = {
  eventName?: string;
};

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