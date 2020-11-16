import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

// const SCALE_AMOUNT = 0.004;
const SCALE_MIN = 0.1;
const PLACEHOLDER_SIZE = 350;
let PLACEHOLDER_SCALE = 0.1;
let EDIT_ICON_SCALE = 0.01;

function Editor(props) {
  if(isMobile) {
    PLACEHOLDER_SCALE = 0.4;
    EDIT_ICON_SCALE = 0.05
  }

  const [screenWidth,setScreenWidth] = useState(window.screen.width);

  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

  const [placeHolderInfo,setPlaceHolderInfo] = useState({x:0,y:0,rot:0,scale:1});

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [scaleMobileStart,setScaleMobileStart] = useState({});

  const [touchCount,setTouchCount] = useState(0);

  const [showTools,setShowTools] = useState(false);
  const [editorScale,setEditorScale] = useState(1);
  const [isDragging,setIsDragging] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isChanging,setIsChanging] = useState(false);
 
  // //execute when resizing finish
  let resizeLoop;
  window.addEventListener("resize", ()=>{
    setScreenWidth(window.screen.width);
    clearTimeout(resizeLoop);
    resizeLoop = setTimeout(doneResizing, 500);
  });

  function doneResizing(){
    updateImageSize();
  }

  const image = () => {
    return images.find(image => image.id == imageSelected);
  }

  useEffect(() => {
    if(imageSelected!=-1) {
      setIsChanging(true);
      setTimeout(()=> {
        setIsChanging(false);
        updateImageSize(true);
      }, 200);
    }
  }, [imageSelected]);

  useEffect(() => {
    if(imageSelected!=-1) store.dispatch({type:'UPDATE_PLACEHOLDER',placeHolder:placeHolderInfo,id:image().id});
  }, [placeHolderInfo]);

  useEffect(() => {
    if(touchCount>1) {
      setIsDragging(false);
    }
  }, [touchCount]);


  const updateImageSize = (initPlaceHolder) => {
    if(imageSelected!=-1){
      let editorHeight = document.getElementById('editorWindow').clientHeight;
      let editorWidth = document.getElementById('editorWindow').clientWidth;

      let ratio = image().width / image().height;
      let editorRatio = editorWidth/editorHeight;
      let editorScale;

      if(ratio>editorRatio) {
        editorScale = editorWidth/image().width;
      }
      else {
        editorScale = editorHeight/image().height;
      }

      setEditorScale(editorScale);

      if(initPlaceHolder){
        if(image().placeHolder) setPlaceHolderInfo(image().placeHolder);
        else setPlaceHolderInfo({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:image().width*0.5-PLACEHOLDER_SIZE*0.5,y:image().height*0.5-PLACEHOLDER_SIZE*0.5,rot:0,scale:window.screen.width*PLACEHOLDER_SCALE/PLACEHOLDER_SIZE/editorScale});
      }
    }
  }

  const handleDragStart = (ev) => {
    setIsDragging(true);
    setDragStart({
      x:ev.clientX,
      y:ev.clientY,
      startX:placeHolderInfo.x,
      startY:placeHolderInfo.y,
    });
  }

  const handleDragMove = (ev) => {
    let x = (ev.clientX - dragStart.x)/editorScale;
    let y = (ev.clientY - dragStart.y)/editorScale;
    setPlaceHolderInfo({width:placeHolderInfo.width,height:placeHolderInfo.height,x:dragStart.startX+x,y:dragStart.startY+y,rot:placeHolderInfo.rot,scale:placeHolderInfo.scale});
  }

  const handleScaleStart = (ev) => {
    setIsScaling(true);
    setScaleStart({
      x:ev.clientX,
      y:ev.clientY,
      centerX:ev.clientX-document.getElementById('headPlaceHolder').clientWidth*0.5*editorScale*placeHolderInfo.scale,
      centerY:ev.clientY+document.getElementById('headPlaceHolder').clientHeight*0.5*editorScale*placeHolderInfo.scale,
      dist:Math.hypot(document.getElementById('headPlaceHolder').clientWidth*0.5*editorScale*placeHolderInfo.scale,document.getElementById('headPlaceHolder').clientHeight*0.5*editorScale*placeHolderInfo.scale),
      scale:placeHolderInfo.scale,
      rotation:placeHolderInfo.rot,
    });
  }

  const handleScaleMove = (ev) => {
    let x = ev.clientX - scaleStart.centerX;
    let y = ev.clientY - scaleStart.centerY; 
    let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    if (scale<SCALE_MIN) scale = SCALE_MIN;
    let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 + 45);
    setPlaceHolderInfo({width:placeHolderInfo.width,height:placeHolderInfo.height,x:placeHolderInfo.x,y:placeHolderInfo.y,rot:rot,scale:scale});
  }

  const handleScaleMobileStart = (touches) => {
    setIsScaling(true);
    // console.log(touches);

    // console.log( Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY) );

    setScaleMobileStart({
      dist: Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY),
      scale:placeHolderInfo.scale,
      rotation:placeHolderInfo.rot,
    });
  }

  const handleScaleMobileMove = (touches) => {
    console.log( Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY) );
    // let x = ev.clientX - scaleStart.centerX;
    // let y = ev.clientY - scaleStart.centerY; 
    // let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    // if (scale<SCALE_MIN) scale = SCALE_MIN;
    // let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 + 45);
    // setPlaceHolderInfo({width:placeHolderInfo.width,height:placeHolderInfo.height,x:placeHolderInfo.x,y:placeHolderInfo.y,rot:rot,scale:scale});
  }
  
  const handleEnd = () => {
    console.log('end');
    setTouchCount(0);
    if(isScaling) setIsScaling(false);
    if(isDragging) setIsDragging(false);
  }

  let mouseMove = null;
  if(isScaling) mouseMove=handleScaleMove;
  else if(isDragging) mouseMove=handleDragMove;

  const editor = document.getElementById('editorContainer');
  if(editor) editor.addEventListener('touchmove', e => {
      e.preventDefault();
  }, { passive: false });

  const handleTouchMove = (e) => {
    // if(showTools){
    //   // if(e.target==document.getElementById('dragClickArea')) handleDragMove(e.nativeEvent.targetTouches[0]);
    //   if(e.target==document.getElementById('dragClickArea')){
    //     if(e.nativeEvent.targetTouches.length==1) handleDragMove(e.nativeEvent.targetTouches[0]);
    //     // else console.log(e.nativeEvent.targetTouches);
    //   }
    //   
    // }
    if(showTools){
      if(isDragging && e.target==document.getElementById('dragClickArea') ) handleDragMove(e.nativeEvent.targetTouches[0]);
      // else if(isScaling) handleScaleMobileMove(e.nativeEvent.targetTouches);
      else if(isScaling && e.target==document.getElementById('editIcon')) handleScaleMove(e.nativeEvent.targetTouches[0])
    }
  } 

  const handleTouchStart = (e) => {
    console.log(e.target);
    if(e.target==document.getElementById('dragClickArea')){
      if(e.nativeEvent.targetTouches.length==1&&touchCount==0) {
        handleDragStart(e.nativeEvent.targetTouches[0]);
      }
      // else if(e.nativeEvent.targetTouches.length==2) {
      //   handleScaleMobileStart(e.nativeEvent.targetTouches)
      // }
    }

    if(e.target==document.getElementById('editIcon')) handleScaleStart(e.nativeEvent.targetTouches[0]);
    setTouchCount(touchCount+1);
  }

  return (
    <div id="editorContainer" 
      onMouseMove={!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchEnd={isMobile?handleEnd:null} 
      onTouchStart={isMobile?handleTouchStart:null}
    >

      <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >上傳圖片以編輯</div>
      {imageSelected!=-1?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+image().url+')',width:image().width,height:image().height,transform: `scale(${editorScale})`}}>

            <div id='headPlaceHolder' className="head"
              style={{width:placeHolderInfo.width,height:placeHolderInfo.height,transform: `translate(${placeHolderInfo.x}px, ${placeHolderInfo.y}px) rotate(${placeHolderInfo.rot}deg) scale(${placeHolderInfo.scale})`}}
              onMouseEnter={()=>setShowTools(true)} 
              onMouseLeave={()=>{if(!isScaling||isMobile) setShowTools(false)}}
            >
              
              <div className='tools' style={showTools?{opacity:1,borderWidth:4/Math.min(1,placeHolderInfo.scale)}:{opacity:0}}>

                <div id='dragClickArea' draggable="false" 
                  style={{width:'100%',height:'100%'}} 
                  onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
                />

                <div id='editIcon' draggable="false" 
                  style={{top:screenWidth*EDIT_ICON_SCALE*0.5,right:screenWidth*EDIT_ICON_SCALE*0.5,width:screenWidth*EDIT_ICON_SCALE,height:screenWidth*EDIT_ICON_SCALE,transform: `scale(${1/placeHolderInfo.scale/editorScale})`}}
                  onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
                />

              </div>
            </div>
            
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}


export default Editor;
