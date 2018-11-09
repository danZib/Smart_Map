import React from 'react';

const svgCircle = (props) => {
  return (
    <circle
      cx={props.x}
      cy={props.y}
      r={props.radius}
      fill={props.color}
    />
  );
}

export default svgCircle;
