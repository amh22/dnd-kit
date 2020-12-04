import React, {useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  ActivationConstraint,
  DndContext,
  DraggableClone,
  Modifiers,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  restrictToWindowEdges,
  useSensor,
  useDraggable,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {CSS} from '@dnd-kit/utilities';

import {Item, List} from '../../components';

export default {
  title: 'Core|Draggable/Clone',
};

interface Props {
  activationConstraint?: ActivationConstraint;
  handle?: boolean;
  translateModifiers?: Modifiers;
  cloneTranslateModifiers?: Modifiers;
  snapshot?: boolean;
  value?: string;
}

function Clone({
  activationConstraint,
  translateModifiers,
  cloneTranslateModifiers,
  handle,
  snapshot,
  value = 'Drag me',
}: Props) {
  const [active, setActive] = useState<{id: UniqueIdentifier} | null>(null);
  const [{translate}, setTranslate] = useState({
    translate: {x: 0, y: 0},
    initialTranslate: {x: 0, y: 0},
  });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useMemo(() => [mouseSensor, touchSensor, keyboardSensor], [
    mouseSensor,
    touchSensor,
    keyboardSensor,
  ]);

  return (
    <DndContext
      sensors={sensors}
      translateModifiers={translateModifiers}
      onDragStart={({active}) => {
        setActive(active);
      }}
      onDragMove={() => {}}
      onDragEnd={({delta}) => {
        setTranslate(({translate}) => ({
          initialTranslate: {
            x: translate.x + delta.x,
            y: translate.y + delta.y,
          },
          translate: {
            x: translate.x + delta.x,
            y: translate.y + delta.y,
          },
        }));
      }}
      onDragCancel={() => {
        setTranslate(({initialTranslate}) => ({
          translate: initialTranslate,
          initialTranslate,
        }));
      }}
    >
      <div
        style={{
          transform: CSS.Transform.toString({
            ...translate,
            scaleX: 1,
            scaleY: 1,
          }),
        }}
      >
        <DraggableItem value={value} index={0} handle={handle} />
      </div>
      {createPortal(
        <DraggableClone translateModifiers={cloneTranslateModifiers}>
          {active && !snapshot ? (
            <DraggableItem value={value} index={0} handle={handle} clone />
          ) : null}
        </DraggableClone>,
        document.body
      )}
    </DndContext>
  );
}

interface DraggableItemProps {
  clone?: boolean;
  value: React.ReactNode;
  index: number;
  handle?: boolean;
  wrapperStyle?: React.CSSProperties;
}

function DraggableItem({
  value,
  handle,
  clone,
  wrapperStyle,
}: DraggableItemProps) {
  const {setNodeRef, listeners, isDragging} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Item
      clone={clone}
      ref={setNodeRef}
      value={value}
      dragging={isDragging}
      wrapperStyle={wrapperStyle}
      handle={handle}
      listeners={listeners}
    />
  );
}

export const WithClone = () => <Clone />;
export const WithSnapshotClone = () => <Clone snapshot />;

export const DragHandle = () => (
  <Clone value="Drag me with the handle" handle />
);
export const HorizontalAxis = () => (
  <Clone
    value="I'm only draggable horizontally"
    translateModifiers={[restrictToHorizontalAxis]}
  />
);
export const VerticalAxis = () => (
  <Clone
    value="I'm only draggable vertically"
    translateModifiers={[restrictToVerticalAxis]}
  />
);
export const RestrictToWindowEdges = () => (
  <Clone
    value="I'm only draggable within the window bounds"
    translateModifiers={[restrictToWindowEdges]}
  />
);
