import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';
import { mdiCursorMove } from '@mdi/js';


function Slider(props) {

  const status = useSelector(state => state.status);
  const sliderCount = useSelector(state => state.sliderCount);
  const screen = useSelector(state => state.screen);

  const {vertical,images,selectedId,selectedText,selectItem,deleteItem,canDelete,canDrag,border} = props;

  const [draggingId,setDraggingId] = useState(null);
  const [draggingOrder,setDraggingOrder] = useState(null);
  const [dragStart,setDragStart] = useState({});
  const [dragAmount,setDragAmount] = useState({x:0,y:0});
  const [highlighted,setHighlighted] = useState(-1);
  const [loading,setLoading] = useState([]);
  const [deleting,setDeleting] = useState(false);
  const [sliderLoading,setSliderLoading] = useState(false);

  useEffect(() => {
    images.forEach(image=>{
      if(image.deleted) {
        setLoading(loading.filter(x=>x==image.id));
        setDeleting(true);
        store.dispatch({type:'DELETE_IMAGE_FINISH',id:image.id})
        setTimeout(()=>setDeleting(false),1000);
      }
    })
    if(sliderLoading&&images.length==sliderCount) setSliderLoading(false);
  }, [images]);

  useEffect(() => {
   if(sliderCount>images.length) setSliderLoading(true);
   console.log('yes',sliderCount,images.length);
  }, [sliderCount]);

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
    let ratio = image.width / image.height;
    let width;
    let height;
    // if(image.deleted)  {width=0;height=0;}
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
    if(image.deleted) className += ' deleted';
    let isLoading = false;
    if(loading.some(x=>x==image.id) ) {
      isLoading = true;
      className += ' loading';
    }

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

          <div className='sliderImage' style={{width:width*0.9,height:height*0.9}}>
            <img src={image.url} draggable="false" style={{width:'100%',height:'100%'}} onClick={isMobile? ()=>{if(highlighted==image.id) setHighlighted(-1); else setHighlighted(image.id)}:()=>selectItem(image.id)} 
              onMouseLeave={(e)=>{
                if(e.relatedTarget.className!='deleteButtonClickArea' && e.relatedTarget.className!='chooseButtonClickArea') setHighlighted(-1);
              }
            }/>

            <div className={image.order==0?'coverText':'coverText hidden'} style={vertical?{top:-20}:{bottom:-28}}>封面</div>
            
            {canDelete&&!isMobile?(
              <>
                <div className='sliderButtonClickArea' 
                  style={{top:-10,right:-10}}
                  onClick={()=>{setLoading(loading.concat(image.id));deleteItem(image.id)}}
                >
                  <div className='sliderButton'><Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.7} color="white"/></div>
                </div>

                <div className='sliderButtonClickArea' draggable="false"
                  style={{top:-10,left:-10}}
                  onMouseDown={(ev)=>handleDragStart(ev,image.id,image.order)}
                >
                  <div className='sliderButton'><Icon path={mdiCursorMove} style={{transform:`translate(0.5px,0.5px)`}} size={0.7} color="white"/></div>
                </div>
              </>
            ):null}   

          </div>

          <div className="statusWrapper">
            <div className="statusWrapperBox">
              {selectedText}
            </div>
          </div>

          {canDelete&&isMobile?
            <>
              <div className="sliderButtonClickArea" 
                style={{padding:10,right:-20,top:-20}}
                onClick={()=>{if(highlighted==image.id) {setLoading(loading.concat(image.id));deleteItem(image.id);} }}
              >
                <div className='sliderButton'>
                  <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.7} color="white"/>
                </div>
              </div>

              <div className="sliderButtonClickArea" 
                style={{padding:10,left:-20,top:-20}}
                onTouchStart={(ev)=>handleDragStart(ev.nativeEvent.targetTouches[0],image.id,image.order)}
              >
                <div className='sliderButton'>
                  <Icon path={mdiCursorMove} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.7} color="white"/>
                </div>
              </div>
            </>
          :null}

    
          <div className="chooseButtonWrapper">
            <div className="chooseButtonClickArea" onClick={()=>{if(highlighted==image.id)selectItem(image.id)}}>
              <div className="chooseButton">
                {selectedId==image.id?'取消':'選擇'}
              </div>
            </div>
          </div>

          <div className={isLoading?'centerChildren':'centerChildren hidden'} style={{pointerEvents:'none',position:'absolute',backgroundColor:'rgba(255,255,255,0.6)'}}>
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
  if(deleting) className += ' deleting';

  return (
    <div className={"sliderContainer"+className} 
      onMouseMove={!isMobile? handleDragMove:null} 
      onTouchMove={isMobile?(ev)=>handleDragMove(ev.nativeEvent.targetTouches[0]):null} 
      onMouseUp={isMobile?null:handleEnd}
      // onTouchStart={isMobile?handleTouchStart:null}
      onTouchEnd={isMobile?handleEnd:null} 
    >
      
      <div className="sliderScrollContainer" style={{overflow:draggingId==null?'scroll':'hidden'}}>
        <div className="sliderContentContainer" style={vertical?{height:images.length*HEIGHT,width:WIDTH}:{width:images.length*WIDTH,height:HEIGHT}}>
          {imagesList}
        </div>

        <div className={sliderLoading?'sliderLoader':'sliderLoader hidden'} style={{width:WIDTH*0.5, height:HEIGHT}}>
          <div style={{transform:`scale(0.3)`}}>
            <div className='loader'/>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Slider;
