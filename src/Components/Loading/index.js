import './style.css';
import React from 'react';

const Loading = (props) => {

  return (
    <div style={{transform:`scale(${props.scale})`}} class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  );
}

export default Loading;





