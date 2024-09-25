import React from 'react';

const Spinner = ({ size }) => {
  return (
    <div className='' style={{ width: `${size}px` }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        width="200"
        height="200"
        style={{ width: '100%', height: '100%', shapeRendering: 'auto', display: 'block', background: 'rgb(255, 255, 255)' }}
      >
        <g>
          <path
            stroke="none"
            fill="#0265c0"
            d="M17 50A33 33 0 0 0 83 50A33 35.7 0 0 1 17 50"
          >
            <animateTransform
              values="0 50 51.35;360 50 51.35"
              keyTimes="0;1"
              repeatCount="indefinite"
              dur="1s"
              type="rotate"
              attributeName="transform"
            />
          </path>
          <g></g>
        </g>
      </svg>
    </div>
  );

};

export default Spinner;