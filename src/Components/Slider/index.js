import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';


function Slider(props) {

  

  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);

  const {vertical,images,selectedId,selectedText,selectItem,deleteItem,canDelete,border} = props;

  const [draggingId,setDraggingId] = useState(null);
  const [draggingOrder,setDraggingOrder] = useState(null);
  const [dragStart,setDragStart] = useState({});
  const [dragAmount,setDragAmount] = useState({x:0,y:0});
  const [highlighted,setHighlighted] = useState(-1);

  let WIDTH,HEIGHT;
  if(screen.screenWidth>768 || screen.screenHeight>768) {
    if(vertical) {WIDTH=150;HEIGHT=100;}
    else {WIDTH=200;HEIGHT=100;}
  }
  else {
    if(vertical) {WIDTH=100;HEIGHT=100;}
    else {WIDTH=100;HEIGHT=100;}
  }

  const handleDragStart = (ev,id,order) => {
    console.log('start');
    setDraggingId(id);
    setDraggingOrder(order);
    setDragStart({
      x:ev.clientX,
      y:ev.clientY,
      // startX:objectInfo.x,
      // startY:objectInfo.y,
    });
  }

  const handleDragMove = (ev) => {    
    let x = ev.clientX - dragStart.x;
    setDragAmount({x:x,y:ev.clientY - dragStart.y})
  }

  const handleEnd = () => {
    if(draggingId!=null){

      let change_order = null;
      if(dragAmount.x<0&&Math.abs(dragAmount.x)>WIDTH*0.5) {
        change_order = -1 + ~~((dragAmount.x+WIDTH*0.5)/WIDTH);
      }
      else if (dragAmount.x>WIDTH*1.5){
        change_order = 1 + ~~((dragAmount.x-WIDTH*1.5)/WIDTH);
      }
      if(change_order!=null) store.dispatch({type:'CHANGE_ORDER',id:draggingId,change:change_order});

      setDraggingId(null);
      setDraggingOrder(null);
      setDragAmount({x:0,y:0});
    }
  }

 
  const imagesList = images.map((image,index) => {
    let ratio = image.width / image.height;
    let width;
    let height;
    if(ratio>WIDTH/HEIGHT){
      width=WIDTH;
      height=WIDTH/ratio;
    }
    else {
      height=HEIGHT;
      width=HEIGHT*ratio;
    }
    let className = '';
    if(selectedId==image.id) className += ' selected';
    if(highlighted==image.id) className += ' pressed';
    if(draggingId==image.id) className += ' dragging'; else  className += ' notDragging';
    if(border) className += ' border';

    let drag = {x:0,y:0};
    if(draggingId==image.id) drag = dragAmount;
    else if(draggingId!=null) {
      let diff = image.order - draggingOrder;
      if (diff>0&&dragAmount.x>diff*WIDTH+WIDTH*0.5) drag.x = -WIDTH;
      else if (diff<0&&dragAmount.x<diff*WIDTH+WIDTH*0.5) drag.x = WIDTH;
    }
    
    return(
      <div className={"sliderImageWrapper"+className} 
        style={{ 
          width:WIDTH, 
          height:HEIGHT, 
          "--slider-image-width": WIDTH+'px', 
          "--slider-image-height": HEIGHT+'px',
          transform: `translate(${WIDTH*image.order+drag.x}px, ${drag.y}px)`
        }}
      >
        <div className='sliderImageInner' style={{width:WIDTH,height:HEIGHT}}>
          <div className='sliderImage' style={{width:width*0.9,height:height*0.9}}>
            <img src={image.url} style={{width:'100%',height:'100%'}} onClick={isMobile? ()=>{if(highlighted==image.id) setHighlighted(-1); else setHighlighted(image.id)}:()=>selectItem(image.id)} 
              onMouseLeave={(e)=>{
                if(e.relatedTarget.className!='deleteButtonClickArea' && e.relatedTarget.className!='chooseButtonClickArea') setHighlighted(-1);
              }
            }/>
            
            {canDelete&&!isMobile?(
              <div className='deleteButton' onClick={()=>{deleteItem(image.id);}}>
                <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.8} color="#DDDDDD"/>
              </div>
            ):null}
          </div>

          <div className="statusWrapper">
            <div className="statusWrapperBox">
              {selectedText}
            </div>
          </div>

          {canDelete&&isMobile?(
            <div className="deleteButtonClickArea" onClick={()=>{if(highlighted==image.id)deleteItem(image.id)}}>
              <div className='deleteButton'>
                <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.8} color="#CCCCCC"/>
              </div>
            </div>
          ):null}

          <div className="chooseButtonWrapper">
            <div className="chooseButtonClickArea" onClick={()=>{if(highlighted==image.id)selectItem(image.id)}}>
              <div className="chooseButton">
                {selectedId==image.id?'取消':'選擇'}
              </div>
            </div>
          </div>

          <div 
            onMouseDown={(ev)=>handleDragStart(ev,image.id,image.order)}
            style={{position:'absolute',width:30,height:30,backgroundColor:'red',top:0,left:0}}>
          </div>

        </div>

      </div>
    )
  });

  let className = '';
  if(status.mode=='admin') className += ' isAdmin';
  if(vertical) className += ' vertical';
  if(draggingId==null) className += ' notDragging';

  return (
    <div className={"sliderContainer"+className} 
      onMouseMove={!isMobile? handleDragMove:null} 
      // onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      // onTouchStart={isMobile?handleTouchStart:null}
      // onTouchEnd={isMobile?handleEnd:null} 
    >
      
      <div className="sliderScrollContainer">
        <div className="sliderContentContainer" style={{width:images.length*WIDTH,height:HEIGHT}}>
          {imagesList}
        </div>
      </div>
    </div>
  );
}

export default Slider;
