import type { Shape } from '../../../types/editor';
import { FaEye, FaEyeSlash, FaLock, FaLockOpen, FaTrash } from 'react-icons/fa';

interface MenuLayers {
  updateShape: (id: string, attrs: Partial<Shape>) => void;
  shapes: Shape[];
  deleteSelected: (a?: string) => void;
  selectedIds: string[]
}

export const MenuLayers = (props: MenuLayers) => {

  const { updateShape, shapes, deleteSelected, selectedIds } = props;

  return (
    <div className='menu-content'>
      {
        shapes.map((shape) => (
          <div className='content-layer-view' style={{
            borderColor: selectedIds.find(a => a === shape.id) ? '#6F70FD' : '#0e131850'
          }}>
            <div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                flexGrow: 1
              }}>
                {shape.type}
                <span style={{
                  maxWidth: 110,
                  textOverflow: 'ellipsis',
                  textWrap: 'nowrap',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  {shape.id?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                flexGrow: 1
              }}>
                <button className='icon-button' onClick={() => {
                  updateShape(shape.id, {
                    show: !shape.show
                  })
                }}>
                  {shape.show ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
                <button className='icon-button' onClick={() => {
                  updateShape(shape.id, {
                    draggable: !shape.draggable
                  })
                }}>
                  {shape.draggable ? <FaLock size={16} /> : <FaLockOpen size={16} />}
                </button>
                <button className='icon-button' onClick={() => {
                  deleteSelected(shape.id)
                }}>
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      }
    </div>

  );
};