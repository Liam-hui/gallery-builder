import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import TopBar from '../../Components/TopBar';
import Icon from '@mdi/react'
import { mdiArrowLeftRightBold } from '@mdi/js';
import { mdiExclamationThick } from '@mdi/js';
import { mdiFlipHorizontal } from '@mdi/js';
import { mdiDelete } from '@mdi/js';
import { mdiArrowLeftBold } from '@mdi/js';
import { mdiRotateLeft } from '@mdi/js';

const PLACEHOLDER_SIZE = 350;
let PLACEHOLDER_SCALE = 0.1;
let EDIT_ICON_SCALE = 0.01;

function Editor(props) {
  if(isMobile) {
    PLACEHOLDER_SCALE = 0.4;
    EDIT_ICON_SCALE = 0.05
  }

  const screen = useSelector(state => state.screen);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);
  const [imageIndex,setImageIndex] = useState(-1);

  const [iconInfo,setIconInfo] = useState({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:0,y:0,rot:0,scale:1,flip:false});
  const [editorScale,setEditorScale] = useState(1);

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [dragTwoFingerXY,setDragTwoFingerXY] = useState([{},{}]);
  const [dragTwoFingerStart,setDragTwoFingerStart] = useState({scale:1,dist:-1});
  const [touchCount,setTouchCount] = useState(0);

  const [isEditing,setIsEditing] = useState(false);
  const [isDragging,setIsDragging] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isTwoFingerDragging,setIsTwoFingerDragging] = useState(false);
  const [isChanging,setIsChanging] = useState(false);

  const [steps,setSteps] = useState([]);
  const [stepsRecord,setStepsRecord] = useState([]);

  const editor = document.getElementById('editorImage');
  if(editor) editor.addEventListener('touchmove', e => {
      e.preventDefault();
  }, { passive: false });

  const image = () => {
    if(imageSelected==-1) return null;
    else return images.find(image => image.id == imageSelected)
  }

  const icon = () => {
    if(imageSelected==-1) return null;
    else if(images.find(image => image.id == imageSelected).iconSelected==-1) return null;
    else return icons.find(icon=>icon.id==images.find(image => image.id == imageSelected).iconSelected); 
  }

  useEffect(() => {
    if(imageIndex==-1 && images.length>0) {
      store.dispatch({type:'SELECT_IMAGE',id:images[0].id});
      setImageIndex(0);
      setSteps(images.map(image=>[]));
      setStepsRecord(images.map(image=>-1));
    }
  }, [images]);
 
  useEffect(() => {
    updateImageSize();
  }, [screen]);

  useEffect(() => {
    if(imageSelected!=-1) {
      setIsChanging(true);
      setTimeout(()=> {
        setIsChanging(false);
        updateImageSize();
        updateEditorIconInfo();
        setImageIndex(images.findIndex(image=>image.id==imageSelected));
      }, 200);
    }
  }, [imageSelected]);

  useEffect(() => {
    updateEditorIconInfo();
    if (icon()!=null) setIsEditing(false);
    else if(icon()==null) {
      let steps_ = steps.slice();
      steps_[imageIndex] = [];
      setSteps(steps_);

      let stepsRecord_ = stepsRecord.slice();
      stepsRecord_[imageIndex] = -1;
      setStepsRecord(stepsRecord_);
    }
  }, [icon()]);

  useEffect(() => {
    if(touchCount>1) {
      setIsDragging(false);
    }
  }, [touchCount]);

  useEffect(() => {
    if(isTwoFingerDragging) {
      let dist = Math.hypot(dragTwoFingerXY[0].x-dragTwoFingerXY[1].x,dragTwoFingerXY[0].y-dragTwoFingerXY[1].y);
      let scale = dragTwoFingerStart.scale*dist/dragTwoFingerStart.dist;
      setIconInfo({width:iconInfo.width,height:iconInfo.height,x:iconInfo.x,y:iconInfo.y,rot:iconInfo.rot,scale:scale,flip:iconInfo.flip});
    }
  }, [dragTwoFingerXY]);

  const saveStep = () => {
    store.dispatch({type:'UPDATE_ICONINFO',iconInfo:iconInfo,id:imageSelected});
    let steps_ = steps.slice();

    if(stepsRecord[imageIndex] != -1) {
      steps_[imageIndex] = steps_[imageIndex].slice(0,stepsRecord[imageIndex]+1);
      let stepsRecord_ = stepsRecord.slice();
      stepsRecord_[imageIndex] = -1;
      setStepsRecord(stepsRecord_);
    }

    steps_[imageIndex].push(iconInfo);
    setSteps(steps_);
  }

  const stepBack = () => {
    if(steps[imageIndex].length>1 && stepsRecord[imageIndex]!=0){

      let theStep;
      if(stepsRecord[imageIndex] == -1) theStep = steps[imageIndex].length-2; 
      else theStep = stepsRecord[imageIndex]-1;

      let newIconInfo = steps[imageIndex][theStep];
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
      setIconInfo(newIconInfo);

      let stepsRecord_ = stepsRecord.slice();
      stepsRecord_[imageIndex] = theStep;
      setStepsRecord(stepsRecord_);
    }
  }

  const stepRedo = () => {
    if(stepsRecord[imageIndex]!=-1 && steps[imageIndex].length>stepsRecord[imageIndex]+1){

      let theStep = stepsRecord[imageIndex]+1; 

      let newIconInfo = steps[imageIndex][theStep];
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
      setIconInfo(newIconInfo);

      let stepsRecord_ = stepsRecord.slice();
      stepsRecord_[imageIndex] = theStep;
      setStepsRecord(stepsRecord_);
    }
  }

  const updateEditorIconInfo = () => {
    if (icon()!=null) {
      let iconInfo;
      if(image().iconInfo == null) iconInfo= Object.assign({}, image().placeHolder);
      else iconInfo = Object.assign({}, image().iconInfo);
      iconInfo.scale *= (iconInfo.width/icon().width + iconInfo.height/icon().height)*0.5;
      iconInfo.width = icon().width;
      iconInfo.height = icon().height;
      setIconInfo(iconInfo);
    }
  }

  const updateImageSize = () => {
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
      return editorScale;
    }
  }

  const handleDragStart = (ev) => {
    setIsDragging(true);
    setDragStart({
      x:ev.clientX,
      y:ev.clientY,
      startX:iconInfo.x,
      startY:iconInfo.y,
    });
  }
  const handleDragMove = (ev) => {
    let x = (ev.clientX - dragStart.x)/editorScale;
    let y = (ev.clientY - dragStart.y)/editorScale;
    setIconInfo({width:iconInfo.width,height:iconInfo.height,x:dragStart.startX+x,y:dragStart.startY+y,rot:iconInfo.rot,scale:iconInfo.scale,flip:iconInfo.flip});
  }

  const handleScaleStart = (ev) => {
    setIsScaling(true);
    let head = document.getElementById('headMoving').getBoundingClientRect();
    let centerX = head.left+head.width*0.5;
    let centerY = head.top+head.height*0.5;
    let x = ev.clientX - centerX;
    let y = ev.clientY - centerY; 
    setScaleStart({
      centerX:centerX,
      centerY:centerY,
      dist:Math.hypot(x,y),
      scale:iconInfo.scale,
      rotation:iconInfo.rot,
      angle: Math.atan2(y,  x) / Math.PI * 180,
    });
  }
  const handleScaleMove = (ev) => {
    let x = ev.clientX - scaleStart.centerX;
    let y = ev.clientY - scaleStart.centerY; 
    let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    // if (scale<SCALE_MIN) scale = SCALE_MIN;
    let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 - scaleStart.angle);
    setIconInfo({width:iconInfo.width,height:iconInfo.height,x:iconInfo.x,y:iconInfo.y,rot:rot,scale:scale,flip:iconInfo.flip});
  }

  
  const handleFlip = () => {
    if(isEditing){
      let iconInfo_ = {width:iconInfo.width,height:iconInfo.height,x:iconInfo.x,y:iconInfo.y,rot:iconInfo.rot,scale:iconInfo.scale,flip:!iconInfo.flip};
      setIconInfo(iconInfo_);
      saveStep();
    }
  }

  const handleEnd = () => {
    if(isEditing){
      console.log('end');
      if(isScaling) setIsScaling(false);
      if(isDragging) setIsDragging(false);
      if(isTwoFingerDragging) {
        setDragTwoFingerStart({scale:1,dist:-1});
        setDragTwoFingerXY([{},{}]);
        setIsTwoFingerDragging(false);
      }
      if(isScaling||isDragging||isTwoFingerDragging) {
        saveStep();
      }
      setTouchCount(0);
    }
  }

  const handleTouchMove = (e) => {
    if(isEditing){
      handleDragTwoFinger(e);
      if(isDragging && document.getElementById('headMoving').contains(e.target))handleDragMove(e.nativeEvent.targetTouches[0]);
      else if(isScaling && e.target==document.getElementById('scaleButton')) handleScaleMove(e.nativeEvent.targetTouches[0])
   }
  } 

  const handleTouchStart = (e) => {

    if(isEditing){
      if(e.targetTouches.length==2){
        handleDragTwoFinger(e,true);
      }
      else if(touchCount==0){
        handleDragTwoFinger(e);
        if(e.target==document.getElementById('scaleButton')) handleScaleStart(e.nativeEvent.targetTouches[0]);
        else if(document.getElementById('headMoving').contains(e.target)&& e.nativeEvent.targetTouches.length==1&&touchCount==0) handleDragStart(e.nativeEvent.targetTouches[0]);
      }
      else if(touchCount==1&&!isScaling){
        handleDragTwoFinger(e,true);
      }
      setTouchCount(touchCount+1);
    }
  }

  const handleDragTwoFinger = (e,start) => {
    let dragTwoFingerXY_ = dragTwoFingerXY;

    if(e.nativeEvent.targetTouches.length==1){
      if(document.getElementById('headMoving')&&document.getElementById('headMoving').contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},dragTwoFingerXY[1]];    
      else dragTwoFingerXY_ = [dragTwoFingerXY[0],{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY}]; 
    }
    else if(e.nativeEvent.targetTouches.length==2){
      if(document.getElementById('headMoving')&&document.getElementById('headMoving').contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},{x:e.nativeEvent.targetTouches[1].clientX,y:e.nativeEvent.targetTouches[1].clientY}];  
    }
    
    setDragTwoFingerXY(dragTwoFingerXY_);

    if(start && Object.keys(dragTwoFingerXY_[0]).length!=0) {
      setIsTwoFingerDragging(true);
      setDragTwoFingerStart({
        scale:iconInfo.scale,
        dist: Math.hypot(dragTwoFingerXY_[0].x-dragTwoFingerXY_[1].x,dragTwoFingerXY_[0].y-dragTwoFingerXY_[1].y)
      });
    }
  }


  let mouseMove = null;
  if(isScaling) mouseMove=handleScaleMove;
  else if(isDragging) mouseMove=handleDragMove;

  return (
    <div id="editorContainer" 
      onMouseMove={!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchStart={isMobile?handleTouchStart:null}
      onTouchEnd={isMobile?handleEnd:null} 
    >

      {/* <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >上傳圖片以編輯</div> */}
      <TopBar back={stepBack} redo={stepRedo}/>
      {imageSelected!=-1?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+image().url+')',width:image().width,height:image().height,transform: `scale(${editorScale})`}}>

          {image().iconSelected!=undefined && image().iconSelected!=-1? (
            <div id='headMoving' className={'head'} 
              style={{
                width:iconInfo.width,
                height:iconInfo.height,
                transform: `translate(${iconInfo.x-iconInfo.width*0.5}px, ${iconInfo.y-iconInfo.height*0.5}px) rotate(${iconInfo.rot}deg) scale(${iconInfo.scale})`
              }}
              onMouseEnter={()=>setIsEditing(true)} 
              onMouseLeave={()=>{if(!isScaling||isMobile) setIsEditing(false)}}
            >
              <div className='headImage' 
                style={{backgroundImage:'url('+icon().url+')',transform: `scaleX(${iconInfo.flip?-1:1})`}}
              />

              {iconInfo.scale>1?(
                <div className="headWarningContainer" style={{width: 40/iconInfo.scale/editorScale,height: 40/iconInfo.scale/editorScale,padding: 10/iconInfo.scale/editorScale}}>
                  <div className='headWarning' style={{borderRadius: 6/iconInfo.scale/editorScale}}>
                    <Icon path={mdiExclamationThick} size={1.2/iconInfo.scale/editorScale} color="white"/>
                  </div>
                </div>
              ):(null)}

              <div className={isEditing?'tools enabled ':'tools'} style={{borderWidth:3/iconInfo.scale/editorScale}}>
                <div id='dragClickArea' draggable="false" 
                  style={{width:'100%',height:'100%'}} 
                  onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
                />

                {/* <div className="editButton" id='scaleButton' draggable="false" 
                  style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
                  onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
                >
                   <Icon style={{pointerEvents:'none'}} path={mdiRotateLeft} size={1} color="white"/>
                </div>

                <div className="editButton" id='flipButton' draggable="false" 
                  style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
                  onClick={isEditing?handleFlip:null}
                >
                   <Icon path={mdiFlipHorizontal} size={1} color="white"/>
                </div>

                <div className="editButton" id='deleteButton' draggable="false" 
                  style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
                  onClick={isEditing?()=>store.dispatch({type:'UNSELECT_ICON',id:imageSelected}):null}
                >
                  <Icon path={mdiDelete} size={1} color="white"/>
                </div> */}
              </div>

            </div>
          ):(
            <div className='head' className={image().iconSelected && image().iconSelected!=-1? 'head hidden' : 'head'} 
              style={{backgroundImage:'url(https://img.icons8.com/material/4ac144/256/user-male.png)',width:image().placeHolder.width,height:image().placeHolder.height,transform: `translate(${image().placeHolder.x-image().placeHolder.width*0.5}px, ${image().placeHolder.y-image().placeHolder.height*0.5}px) rotate(${image().placeHolder.rot}deg) scale(${image().placeHolder.scale})`}}
            />
          )}

          </div>
        </div>
      ):(null)}

      {screen.screenWidth<=768||screen.screenHeight<=768? (
        <div className='editorBottom'>
          <div className={imageIndex>0?'pageArrow':'pageArrow disabled'} onClick={() => {if(imageIndex>0){store.dispatch({type:'SELECT_IMAGE',id:images[imageIndex-1].id}); setImageIndex(imageIndex-1);}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} rotate={0} color="#DDDDDD" style={{transform:`translate(0.5px,0.5px)`}}/>
          </div>

          <div className='pageNumber'>第 {imageIndex+1} 張</div>
          
          <div className={imageIndex<images.length-1?'pageArrow':'pageArrow disabled'} onClick={() => {if(imageIndex<images.length-1){store.dispatch({type:'SELECT_IMAGE',id:images[imageIndex+1].id}); setImageIndex(imageIndex+1);}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{transform:`translate(1.5px,0.5px) rotate(180deg)`}}/>
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}


export default Editor;
