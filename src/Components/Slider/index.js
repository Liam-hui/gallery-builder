import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';
import { mdiCursorMove } from '@mdi/js';


function Slider(props) {

  const {mode,vertical,images,selectedId,selectedText,selectItem,deleteItem,canDelete,canDrag,border} = props;

  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);
  const sliderLock = useSelector(state => state.sliderLock);

  const [draggingId,setDraggingId] = useState(null);
  const [draggingOrder,setDraggingOrder] = useState(null);
  const [dragStart,setDragStart] = useState({});
  const [dragAmount,setDragAmount] = useState({x:0,y:0});

  const [highlighted,setHighlighted] = useState(-1);
  const [sliderLoading,setSliderLoading] = useState(false);

  useEffect(() => {
    if(images.some(x=>x.loading||x.deleting)) setSliderLoading(true);
    else setSliderLoading(false);
  }, [images]);

  let WIDTH,HEIGHT;
  if(screen.screenWidth>768 || screen.screenHeight>768) {
    if(vertical) {WIDTH=150;HEIGHT=100;}
    else {WIDTH=200;HEIGHT=100;}
  }
  else {
    if(vertical) {WIDTH=100;HEIGHT=80;}
    else {WIDTH=100;HEIGHT=100;}
  }

  const handleDragStart = (ev,id,order) => {;
    setDraggingId(id);
    setDraggingOrder(order);
    setDragStart({
      x:ev.clientX,
      y:ev.clientY,
    });
  }

  const handleDragMove = (ev) => {    
    if(draggingId!=null){
      let x = ev.clientX - dragStart.x;
      setDragAmount({x:x,y:ev.clientY - dragStart.y})
    }
  }

  const handleEnd = () => {
    if(draggingId!=null){

      let change_order = null;
      if(vertical){
        if(dragAmount.y<0&&Math.abs(dragAmount.y)>HEIGHT*0.5) {
          change_order = -1 + ~~((dragAmount.y+HEIGHT*0.5)/HEIGHT);
        }
        else if (dragAmount.y>HEIGHT*1.5){
          change_order = 1 + ~~((dragAmount.y-HEIGHT*1.5)/HEIGHT);
        }
      }
      else {
        if(dragAmount.x<0&&Math.abs(dragAmount.x)>WIDTH*0.5) {
          change_order = -1 + ~~((dragAmount.x+WIDTH*0.5)/WIDTH);
        }
        else if (dragAmount.x>WIDTH*1.5){
          change_order = 1 + ~~((dragAmount.x-WIDTH*1.5)/WIDTH);
        }
      }

      if(change_order!=null&&change_order<images.length) store.dispatch({type:'CHANGE_ORDER',id:draggingId,change:change_order,product_id:status.product_id});

      setDraggingId(null);
      setDraggingOrder(null);
      setDragAmount({x:0,y:0});
    }
  }

  const imagesList = images.map((image,index) => {
    if(mode=='icon') image.order = index;
    let ratio = image.width/image.height;
    let width = ratio>WIDTH/HEIGHT? WIDTH:HEIGHT*ratio;
    let height = ratio>WIDTH/HEIGHT? WIDTH/ratio:HEIGHT;

    let className = '';
    if(selectedId==image.id) className += ' selected';
    if(highlighted==image.id) className += ' pressed';
    if(draggingId==image.id) className += ' dragging'; else  className += ' notDragging';
    if(border) className += ' border';
    if(image.loading||image.deleting) className += ' loading';

    let drag = {x:0,y:0};
    if(draggingId==image.id) drag = dragAmount;
    else if(draggingId!=null) {
      let diff = image.order - draggingOrder;
      if(vertical){
        if (diff>0&&dragAmount.y>diff*HEIGHT+HEIGHT*0.5) drag.y = -HEIGHT;
        else if (diff<0&&dragAmount.y<diff*HEIGHT+HEIGHT*0.5) drag.y = HEIGHT;
      }
      else {
        if (diff>0&&dragAmount.x>diff*WIDTH+WIDTH*0.5) drag.x = -WIDTH;
        else if (diff<0&&dragAmount.x<diff*WIDTH+WIDTH*0.5) drag.x = WIDTH;
      }
    }
    
    return(
      <div className={"sliderImageWrapper"+className} 
        style={{ 
          width:WIDTH, 
          height:HEIGHT, 
          "--slider-image-width": WIDTH+'px', 
          "--slider-image-height": HEIGHT+'px',
          transform: vertical? `translate(${drag.x}px, ${HEIGHT*image.order+drag.y}px)` : `translate(${WIDTH*image.order+drag.x}px, ${drag.y}px)`
        }}
      >
        <div className='sliderImageInner' style={{width:WIDTH,height:HEIGHT}}>

          {!image.loading?(
          <>

            <div className='sliderImage' style={{width:width*0.9,height:height*0.9}}>
              <img src={image.url} draggable="false" style={{width:'100%',height:'100%'}} onClick={isMobile? ()=>{if(highlighted==image.id) setHighlighted(-1); else setHighlighted(image.id)}:()=>selectItem(image.id)} 
                onMouseLeave={(e)=>{
                  if(e.relatedTarget.className!='sliderButtonClickArea' && e.relatedTarget.className!='chooseButtonClickArea') setHighlighted(-1);
                }
              }/>

              {mode=='image'?
              <div className={image.order==0?'coverText':'coverText hidden'} style={vertical?{top:-20}:{bottom:-28}}>封面</div>
              :null}
              
              {canDelete&&!isMobile?(
                <div className='sliderButtonClickArea' 
                  style={{top:-10,right:-10}}
                  onClick={()=>{deleteItem(image.id)}}
                >
                  <div className='sliderButton'><Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.7} color="white"/></div>
                </div>
              ):null}   

              {canDrag&&!isMobile?(
                <div className='sliderButtonClickArea' draggable="false"
                  style={{top:-10,left:-10}}
                  onMouseDown={(ev)=>handleDragStart(ev,image.id,image.order)}
                >
                  <div className='sliderButton'><Icon path={mdiCursorMove} style={{transform:`translate(0.5px,0.5px)`}} size={0.7} color="white"/></div>
                </div>
              ):null}   

            </div>

            <div className="statusWrapper">
              <div className="statusWrapperBox">
                {selectedText}
              </div>
            </div>

            {canDelete&&isMobile?(
              <div className="sliderButtonClickArea" 
                style={{padding:10,right:-20,top:-20}}
                onClick={()=>{if(highlighted==image.id)deleteItem(image.id); }}
              >
                <div className='sliderButton' style={{pointerEvents:'none'}}>
                  <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.7} color="white"/>
                </div>
              </div>
            ):null}   

            {canDrag&&isMobile?(
              <div className="sliderButtonClickArea" 
                style={{padding:10,left:-20,top:-20}}
                onTouchStart={(ev)=>handleDragStart(ev.nativeEvent.targetTouches[0],image.id,image.order)}
              >
                <div className='sliderButton'  style={{pointerEvents:'none'}}>
                  <Icon path={mdiCursorMove} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.7} color="white"/>
                </div>
              </div>
            ):null}

            {isMobile&&(mode=='icon'||selectedId!=image.id)?
              <div className="chooseButtonWrapper">
                <div className="chooseButtonClickArea" onClick={()=>{if(highlighted==image.id)selectItem(image.id)}}>
                  <div className="chooseButton">
                    {selectedId==image.id?'取消':'選擇'}
                  </div>
                </div>
              </div>
            :null}
          
          </>
          ):null}

          <div className={image.loading||image.deleting?'centerChildren':'centerChildren hidden'} style={{pointerEvents:'none',position:'absolute'}}>
            <div style={{transform:`scale(0.3)`}}>
              <div className='loader'/>
            </div>
          </div>

        </div>

      </div>
    )
  });
  
  let className = '';
  if(status.mode=='admin') className += ' isAdmin';
  if(vertical) className += ' vertical';
  if(draggingId==null) className += ' notDragging';
  if(sliderLock) className += ' deleting';
  if(sliderLoading) className += '  sliderLoading';

  return (
    <div className={"sliderContainer"+className} 
      onMouseMove={!isMobile? handleDragMove:null} 
      onTouchMove={isMobile?(ev)=>handleDragMove(ev.nativeEvent.targetTouches[0]):null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchEnd={isMobile?handleEnd:null} 
    >
      
      <div className="sliderScrollContainer" style={{overflow:draggingId==null?'scroll':'hidden'}}>
        <div className="sliderContentContainer" style={vertical?{height:images.length*HEIGHT,width:WIDTH}:{width:images.length*WIDTH,height:HEIGHT}}>
          {imagesList}
        </div>
      </div>

    </div>
  );
}

export default Slider;
