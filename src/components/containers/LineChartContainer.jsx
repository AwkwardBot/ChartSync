import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setGraphPositions } from '../../features/graph-positions/graphPositionSlice';
import { fetchGraphPositions, saveGraphPositions } from '../../features/graph-positions/graphPositionThunk';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import LineChartOne from '../charts/line/LineChartOne';
import LineChartTwo from '../charts/line/LineChartTwo';
import { CSS } from '@dnd-kit/utilities';

import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
	MouseSensor,
	TouchSensor,
	KeyboardSensor
} from '@dnd-kit/core';

function Graph({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners} 
      {...attributes}
      style={style}
      className=' bg-white rounded'
    >
      {children}
    </div>
  );
}
export default function LineChartContainer() {
  const dispatch = useDispatch();
  const { graphPositions, loading, error } = useSelector((state) => state.graphPositions);

  useEffect(() => {
    dispatch(fetchGraphPositions());
  }, [dispatch]);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const newGraphOrder = [...graphPositions];
      const activeIndex = graphPositions.indexOf(active.id);
      const overIndex = graphPositions.indexOf(over?.id);

      newGraphOrder[activeIndex] = graphPositions[overIndex];
      newGraphOrder[overIndex] = graphPositions[activeIndex];

      dispatch(setGraphPositions(newGraphOrder));

      dispatch(saveGraphPositions(newGraphOrder));
    }
  };

  const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 5 }
		}),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: closestCenter
		})
	);

  if (error) return <div>Error: {error}</div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={graphPositions} strategy={horizontalListSortingStrategy}>
        <div className="flex flex-col lg:flex-row gap-4 py-3">
          {graphPositions.map((graphId) => (
            <div key={graphId} className="w-full lg:w-1/2">
              <Graph id={graphId}>
                {graphId === 'graph-one' ? <LineChartOne /> : <LineChartTwo />}
              </Graph>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
