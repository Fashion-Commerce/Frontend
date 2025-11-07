
import React, { useState, useLayoutEffect } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'root', // Welcome message, no specific highlight
    title: 'Chào mừng bạn đến với AgentFashion!',
    content: 'Hãy cùng khám phá những tính năng thông minh giúp trải nghiệm mua sắm của bạn trở nên tuyệt vời hơn.',
    position: 'bottom',
  },
  {
    targetId: 'chatbot-panel',
    title: 'Trợ lý AI Cá nhân',
    content: 'Đây là trung tâm điều khiển của bạn. Bạn có thể trò chuyện với AI để tìm sản phẩm, nhận tư vấn thời trang, và quản lý đơn hàng.',
    position: 'right',
  },
  {
    targetId: 'chatbot-panel',
    title: 'Hệ thống Đa Tác tử (Multi-Agent)',
    content: 'Trợ lý AI của chúng tôi bao gồm nhiều "chuyên gia" khác nhau (Tìm kiếm, Tư vấn, Đặt hàng) phối hợp để đưa ra câu trả lời tốt nhất cho bạn.',
    position: 'right',
  },
  {
    targetId: 'product-grid',
    title: 'Khám phá Sản phẩm',
    content: 'Tại đây, bạn có thể duyệt xem tất cả sản phẩm của chúng tôi. Hãy thử yêu cầu AI tìm một món đồ bạn thích!',
    position: 'top',
  },
  {
    targetId: 'header-icons',
    title: 'Các chức năng chính',
    content: 'Dễ dàng truy cập giỏ hàng, danh sách yêu thích và chuyển đổi giao diện sáng/tối tại đây.',
    position: 'bottom',
  }
];

interface GuidedTourProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ currentStep, onNext, onBack, onClose }) => {
  const [highlightStyle, setHighlightStyle] = useState({});
  const [popoverStyle, setPopoverStyle] = useState({});

  useLayoutEffect(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    // Special case for the initial, centered welcome message
    if (step.targetId === 'root') {
      setHighlightStyle({
        position: 'fixed', top: '50%', left: '50%', width: 0, height: 0,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease-in-out',
      });
      setPopoverStyle({
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease-in-out',
      });
      return;
    }

    const targetElement = document.getElementById(step.targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const popoverElement = document.getElementById('tour-popover');
      // Provide a default size to prevent issues on first render before the element is measured
      const popoverRect = popoverElement ? popoverElement.getBoundingClientRect() : { width: 320, height: 180 }; 
      const popoverWidth = popoverRect.width;
      const popoverHeight = popoverRect.height;
      const margin = 15;

      // Set highlight style
      setHighlightStyle({
        position: 'absolute',
        top: `${rect.top - 5}px`, left: `${rect.left - 5}px`,
        width: `${rect.width + 10}px`, height: `${rect.height + 10}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none',
      });

      // Calculate popover position without transform
      let top = 0, left = 0;
      const position = step.position || 'bottom';

      if (position === 'bottom') {
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      } else if (position === 'top') {
        top = rect.top - popoverHeight - margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      } else if (position === 'right') {
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.right + margin;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.left - popoverWidth - margin;
      }
      
      // Clamp values to be within viewport
      if (left < margin) left = margin;
      if (left + popoverWidth > window.innerWidth - margin) left = window.innerWidth - popoverWidth - margin;
      if (top < margin) top = margin;
      if (top + popoverHeight > window.innerHeight - margin) top = window.innerHeight - popoverHeight - margin;
      
      setPopoverStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'none', // Use direct positioning instead of transform
        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out',
      });
    }
  }, [currentStep]);

  const step = TOUR_STEPS[currentStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div style={highlightStyle}></div>
      <div id="tour-popover" style={popoverStyle} className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-80 text-gray-800 dark:text-gray-200">
        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-sm mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Bỏ qua</button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && <button onClick={onBack} className="px-3 py-1 text-sm bg-gray-200 dark:bg-slate-700 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600">Quay lại</button>}
            <button onClick={onNext} className="px-3 py-1 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700">
              {currentStep === TOUR_STEPS.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}
            </button>
          </div>
        </div>
        <div className="flex justify-center mt-4">
            {TOUR_STEPS.map((_, index) => (
                <div key={index} className={`w-2 h-2 rounded-full mx-1 ${index === currentStep ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
