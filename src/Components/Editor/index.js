import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import TopBar from '../../Components/TopBar';
import Icon from '@mdi/react'
import { mdiExclamationThick } from '@mdi/js';
import { mdiFlipHorizontal } from '@mdi/js';
import { mdiDelete } from '@mdi/js';
import { mdiArrowLeftBold } from '@mdi/js';
import { mdiRotateLeft } from '@mdi/js';

import placeHolderImage from '../../placeHolderImage.png';

const PLACEHOLDER_SIZE = 350;
// let PLACEHOLDER_SCALE = 0.1;
// let EDIT_ICON_SCALE = 0.01;

function Editor(props) {
  // if(isMobile) {
  //   PLACEHOLDER_SIZE = 150;
  // }

  const mode = useSelector(state => state.mode);
  const screen = useSelector(state => state.screen);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

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
  const [stepEnabled,setStepEnabled] = useState({back:false,redo:false});
  const [currentStep,setCurrentStep] = useState([]);

  const editor = document.getElementById('editorImage');
  if(editor) editor.addEventListener('touchmove', e => {
      e.preventDefault();
  }, { passive: false });

  const currentImage = imageSelected==-1? null:images.find(image => image.id == imageSelected);
  const currentImageIndex = imageSelected==-1? null:images.findIndex(image => image.id == imageSelected);
  const currentIcon = imageSelected==-1 || currentImage.iconSelected==-1? null:icons.find(icon=>icon.id==currentImage.iconSelected); 

  useEffect(() => {
    if(currentImageIndex==null&&images.length>0) {
      store.dispatch({type:'SELECT_IMAGE',id:images[0].id});
      setSteps(images.map(image=>[]));
      setCurrentStep(images.map(image=>-1));
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
        let editorScale = updateImageSize();
        updateEditorIconInfo(editorScale);
        updateStepEnabled();
      }, 200);
    }
  }, [imageSelected]);

  useEffect(() => {
    if(currentIcon!=null) {
      setIsEditing(false);
      updateEditorIconInfo();
    }
    else {
      let steps_ = steps.slice();
      steps_[currentImageIndex] = [];
      setSteps(steps_);

      let currentStep_ = currentStep.slice();
      currentStep_[currentImageIndex] = -1;
      setCurrentStep(currentStep_);
    }
  }, [currentIcon]);

  useEffect(() => {
    if(touchCount>1) {
      setIsDragging(false);
    }
  }, [touchCount]);

  //step
  const updateStepEnabled = () => {
    let back = currentImageIndex!=null && steps[currentImageIndex].length>1 && currentStep[currentImageIndex]!=0;
    let redo = currentImageIndex!=null && currentStep[currentImageIndex]!=-1 && steps[currentImageIndex].length>currentStep[currentImageIndex]+1;
    setStepEnabled({back:back,redo:redo});
  }

  useEffect(() => {
    updateStepEnabled();
  }, [currentStep]);

  const saveStep = (iconInfo) => {
    store.dispatch({type:'UPDATE_ICONINFO',iconInfo:iconInfo,id:imageSelected});

    if(currentImageIndex!=null) {

      let steps_ = steps.slice(); 
      let currentStep_ = currentStep.slice();

      steps_[currentImageIndex] = steps_[currentImageIndex].slice(0,currentStep_[currentImageIndex]+1);
      steps_[currentImageIndex].push(iconInfo);
      currentStep_[currentImageIndex] += 1;

      setSteps(steps_);
      setCurrentStep(currentStep_);
    }
  }

  const stepBack = () => {
    if(stepEnabled.back){

      let theStep;
      if(currentStep[currentImageIndex] == -1) theStep = steps[currentImageIndex].length-2; 
      else theStep = currentStep[currentImageIndex]-1;

      let newIconInfo = steps[currentImageIndex][theStep];
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
      setIconInfo(newIconInfo);

      let currentStep_ = currentStep.slice();
      currentStep_[currentImageIndex] = theStep;
      setCurrentStep(currentStep_);

    }
  }

  const stepRedo = () => {
    if(stepEnabled.redo){

      let theStep = currentStep[currentImageIndex]+1; 

      let newIconInfo = steps[currentImageIndex][theStep];
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
      setIconInfo(newIconInfo);

      let currentStep_ = currentStep.slice();
      currentStep_[currentImageIndex] = theStep;
      setCurrentStep(currentStep_);
    }
  }

  const updateEditorIconInfo = (editorScale_) => {
    let iconInfo = {};
    if(!editorScale_) editorScale_ = editorScale;
    if (mode=='admin'){
      if(currentImage.iconInfo == null) {
        let PLACEHOLDER_SIZE = screen.screenWidth>768? 350:150;
        iconInfo.rot = 0;
        iconInfo.scale = 1/editorScale_;
        iconInfo.width = PLACEHOLDER_SIZE;
        iconInfo.height = PLACEHOLDER_SIZE;
        iconInfo.x = currentImage.width*0.5;
        iconInfo.y = currentImage.height*0.5;
      }
      else iconInfo = currentImage.iconInfo;
      setIconInfo(iconInfo);
      if(currentStep[currentImageIndex]==-1) saveStep(iconInfo);
    }
    else if (mode=='user' && currentIcon!=null) {
      if(currentImage.iconInfo == null) iconInfo = currentImage.placeHolder;
      else iconInfo = currentImage.iconInfo;
      iconInfo.scale *= (iconInfo.width/currentIcon.width + iconInfo.height/currentIcon.height)*0.5;
      iconInfo.width = currentIcon.width;
      iconInfo.height = currentIcon.height;
      setIconInfo(iconInfo);
      if(currentStep[currentImageIndex]==-1) saveStep(iconInfo);
    }
  }

  const updateImageSize = () => {
    if(imageSelected!=-1){
      let editorHeight = document.getElementById('editorWindow').clientHeight;
      let editorWidth = document.getElementById('editorWindow').clientWidth;

      let ratio = currentImage.width / currentImage.height;
      let editorRatio = editorWidth/editorHeight;
      let editorScale;

      if(ratio>editorRatio) {
        editorScale = editorWidth/currentImage.width;
      }
      else {
        editorScale = editorHeight/currentImage.height;
      }

      setEditorScale(editorScale);
      return editorScale;
    }
  }

  //move
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
      saveStep(iconInfo_);
    }
  }

  const handleEnd = () => {
    if(isEditing){
      // console.log('end');
      if(isScaling) setIsScaling(false);
      if(isDragging) setIsDragging(false);
      if(isTwoFingerDragging) {
        setDragTwoFingerStart({scale:1,dist:-1});
        setDragTwoFingerXY([{},{}]);
        setIsTwoFingerDragging(false);
      }
      if(isScaling||isDragging||isTwoFingerDragging) {
        saveStep(iconInfo);
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

  useEffect(() => {
    if(isTwoFingerDragging) {
      let dist = Math.hypot(dragTwoFingerXY[0].x-dragTwoFingerXY[1].x,dragTwoFingerXY[0].y-dragTwoFingerXY[1].y);
      let scale = dragTwoFingerStart.scale*dist/dragTwoFingerStart.dist;
      setIconInfo({width:iconInfo.width,height:iconInfo.height,x:iconInfo.x,y:iconInfo.y,rot:iconInfo.rot,scale:scale,flip:iconInfo.flip});
    }
  }, [dragTwoFingerXY]);


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
      <TopBar stepEnabled={stepEnabled} back={stepBack} redo={stepRedo}/>
      {imageSelected!=-1?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width,height:currentImage.height,transform: `scale(${editorScale})`}}>

          {mode=='admin' || (currentImage.iconSelected!=undefined && currentImage.iconSelected!=-1)? (
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
                style={mode=='admin'?{backgroundImage:`url(${placeHolderImage})`}:{backgroundImage:'url('+currentIcon.url+')',transform: `scaleX(${iconInfo.flip?-1:1})`}}
              >
                {mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null}
              </div>

              {iconInfo.scale>1&&mode=='user'?(
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

                <div className="editButton" id='scaleButton' draggable="false" 
                  style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
                  onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
                >
                   <Icon style={{pointerEvents:'none'}} path={mdiRotateLeft} size={1} color="white"/>
                </div>

                {mode=='user'?(
                  <>
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
                    </div>
                  </>
                ):null}

              </div>

            </div>
          ):(
            <div className={currentImage.iconSelected && currentImage.iconSelected!=-1? 'headImage hidden' : 'headImage'} 
              style={{backgroundImage:'url('+placeHolderImage+')',width:currentImage.placeHolder.width,height:currentImage.placeHolder.height,transform: `translate(${currentImage.placeHolder.x-currentImage.placeHolder.width*0.5}px, ${currentImage.placeHolder.y-currentImage.placeHolder.height*0.5}px) rotate(${currentImage.placeHolder.rot}deg) scale(${currentImage.placeHolder.scale})`}}
            >
              <p style={{fontSize:currentImage.placeHolder.width*0.1}}>請選擇頭像</p>
            </div>
          )}

          </div>
        </div>
      ):(null)}

      {screen.screenWidth<=768||screen.screenHeight<=768? (
        <div className='editorBottom'>
          <div className={currentImageIndex>0?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex>0){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex-1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} rotate={0} color="#DDDDDD" style={{transform:`translate(0.5px,0.5px)`}}/>
          </div>

          <div className='pageNumber'>第 {currentImageIndex+1} 張</div>
          
          <div className={currentImageIndex<images.length-1?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex<images.length-1){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex+1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{transform:`translate(1.5px,0.5px) rotate(180deg)`}}/>
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}

export default Editor;
