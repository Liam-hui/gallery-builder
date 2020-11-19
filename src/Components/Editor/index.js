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

  const [test,setTest] = useState(1);

  const mode = useSelector(state => state.mode);
  const screen = useSelector(state => state.screen);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

  const [editorScale,setEditorScale] = useState(1);

  const [currentObject,setCurrentObject] = useState(null);
  const [frontObject,setFrontObject] = useState('headObject');
  const [iconInfo,setIconInfo] = useState({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:0,y:0,rot:0,scale:1,flip:false});
  const [textInfo,setTextInfo] = useState({width:200,height:100,x:0,y:0,rot:0,scale:1,scaleX:1,scaleY:1});
  let setInfo,objectInfo;
  if(currentObject==null){
    setInfo = () => console.log('set info null');
  }
  else if(currentObject=='headObject') {
    setInfo = setIconInfo;
    objectInfo = iconInfo;
  }
  else if(currentObject=='textObject') {
    setInfo = setTextInfo;
    objectInfo = textInfo;
  }
  

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [scaleTextStart,setScaleTextStart] = useState({});
  const [dragTwoFingerXY,setDragTwoFingerXY] = useState([{},{}]);
  const [dragTwoFingerStart,setDragTwoFingerStart] = useState({scale:1,dist:-1});
  const [touchCount,setTouchCount] = useState(0);

  const [isEditing,setIsEditing] = useState(false);
  const [isDragging,setIsDragging] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isScalingText,setIsScalingText] = useState(false);
  const [isTwoFingerDragging,setIsTwoFingerDragging] = useState(false);

  const [isChanging,setIsChanging] = useState(false);

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
      }, 200);
    }
  }, [imageSelected]);

  useEffect(() => {
    if(currentIcon!=null) {
      setIsEditing(false);
      updateEditorIconInfo();
    }
    else if(imageSelected!=-1){
      store.dispatch({type:'UPDATE_STEP',step:null,id:imageSelected});
    }
  }, [currentIcon]);

  useEffect(() => {
    if(touchCount>1) {
      setIsDragging(false);
    }
  }, [touchCount]);

  const stepEnabled = () => {
    if(currentImage!=null && currentImage.step!=null){
      let back = currentImage!=null && currentImage.step.store.length>1 && currentImage.step.current!=0;
      let redo = currentImage!=null && currentImage.step.store.length>currentImage.step.current+1;
      return {back:back,redo:redo};
    }
    else return {back:false,redo:false}
  }

  const saveStep = (iconInfo) => {
    store.dispatch({type:'UPDATE_ICONINFO',iconInfo:iconInfo,id:imageSelected});

    if(currentImage.step==null){
      store.dispatch({type:'UPDATE_STEP',step:{current:0,store:[iconInfo]},id:imageSelected});
    }
    else {
      let step = currentImage.step; 

      step.store = step.store.slice(0,step.current+1);
      step.store.push(iconInfo);
      step.current += 1;

      store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
    }
  }

  const stepBack = () => {
    let step = currentImage.step; 
    step.current -= 1;

    let newIconInfo = currentImage.step.store[step.current];
    setIconInfo(newIconInfo);
    store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
    store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
  }

  const stepRedo = () => {
    let step = currentImage.step; 
    step.current += 1;

    let newIconInfo = currentImage.step.store[step.current];
    setIconInfo(newIconInfo);
    store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newIconInfo,id:imageSelected});
    store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
  }

  const updateEditorIconInfo = (editorScale_) => {
    let iconInfo = {};
    if(!editorScale_) editorScale_ = editorScale;
    if (mode=='admin'){
      if(currentImage.iconInfo == null) {
        let PLACEHOLDER_DISPLAY_SIZE = screen.screenWidth>768? 350:150;
        iconInfo.rot = 0;
        iconInfo.scale = PLACEHOLDER_DISPLAY_SIZE/PLACEHOLDER_SIZE/editorScale_;
        iconInfo.width = PLACEHOLDER_SIZE;
        iconInfo.height = PLACEHOLDER_SIZE;
        iconInfo.x = currentImage.width*0.5;
        iconInfo.y = currentImage.height*0.5;
      }
      else iconInfo = currentImage.iconInfo;
      setIconInfo(iconInfo);
      if(currentImage.step==null) saveStep(iconInfo);
    }
    else if (mode=='user' && currentIcon!=null) {
      if(currentImage.iconInfo == null) iconInfo = currentImage.placeHolder;
      else iconInfo = currentImage.iconInfo;
      iconInfo.scale *= (iconInfo.width/currentIcon.width + iconInfo.height/currentIcon.height)*0.5;
      iconInfo.width = currentIcon.width;
      iconInfo.height = currentIcon.height;
      setIconInfo(iconInfo);
      if(currentImage.step==null) saveStep(iconInfo);
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
      startX:objectInfo.x,
      startY:objectInfo.y,
    });
  }

  const handleDragMove = (ev) => {
    let x = (ev.clientX - dragStart.x)/editorScale;
    let y = (ev.clientY - dragStart.y)/editorScale;
    // setInfo({width:objectInfo.width,height:objectInfo.height,x:dragStart.startX+x,y:dragStart.startY+y,rot:objectInfo.rot,scale:objectInfo.scale,flip:objectInfo.flip});
    setInfo({...objectInfo,  ...{x:dragStart.startX+x,y:dragStart.startY+y} });
  }

  const handleScaleStart = (ev) => {
    setIsScaling(true);
    let object = document.getElementById(currentObject).getBoundingClientRect();
    let centerX = object.left+object.width*0.5;
    let centerY = object.top+object.height*0.5;
    let x = ev.clientX - centerX;
    let y = ev.clientY - centerY; 
    setScaleStart({
      centerX:centerX,
      centerY:centerY,
      dist:Math.hypot(x,y),
      scale:objectInfo.scale,
      rotation:objectInfo.rot,
      angle: Math.atan2(y,  x) / Math.PI * 180,
    });
  }

  const handleScaleMove = (ev) => {
    let x = ev.clientX - scaleStart.centerX;
    let y = ev.clientY - scaleStart.centerY; 
    let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 - scaleStart.angle);
    // setInfo({width:objectInfo.width,height:objectInfo.height,x:objectInfo.x,y:objectInfo.y,rot:rot,scale:scale,flip:objectInfo.flip});
    setInfo({...objectInfo,  ...{rot:rot,scale:scale} });
  }

  const handleScaleTextStart = (ev) => {
    setIsScalingText(true);
    let object = document.getElementById(currentObject).getBoundingClientRect();
    let centerX = object.left+object.width*0.5;
    let centerY = object.top+object.height*0.5;
    let x = ev.clientX - centerX;
    let y = ev.clientY - centerY; 
    let angle = Math.PI*0.5 - Math.atan2(x,y) - objectInfo.rot * Math.PI / 180;
    let distX = Math.hypot(x,y) * Math.cos(angle);
    let distY = Math.hypot(x,y) * Math.sin(angle);
    setScaleTextStart({
      centerX:centerX,
      centerY:centerY,
      distX: distX,
      distY: distY,
      scaleX:objectInfo.scaleX,
      scaleY:objectInfo.scaleY,
    });
  }

  const handleScaleTextMove = (ev) => {
    let x = ev.clientX - scaleTextStart.centerX;
    let y = ev.clientY - scaleTextStart.centerY;

    let angle = Math.PI*0.5 - Math.atan2(x,y) - objectInfo.rot * Math.PI / 180;
    let distX = Math.hypot(x,y) * Math.cos(angle);
    let distY = Math.hypot(x,y) * Math.sin(angle);


    let scaleX = Math.max(0.1,scaleTextStart.scaleX*distX/scaleTextStart.distX);
    let scaleY = Math.max(0.1,scaleTextStart.scaleY*distY/scaleTextStart.distY);

    setInfo({...objectInfo,  ...{scaleX:scaleX,scaleY:scaleY} });
  }


  const handleFlip = () => {
    if(isEditing){
      let iconInfo_ = {width:objectInfo.width,height:objectInfo.height,x:objectInfo.x,y:objectInfo.y,rot:objectInfo.rot,scale:objectInfo.scale,flip:!objectInfo.flip};
      setInfo(iconInfo_);
      saveStep(iconInfo_);
    }
  }

  const handleEnd = () => {
    if(isEditing){
      console.log('end');
      if(isScaling) setIsScaling(false);
      if(isScalingText) setIsScalingText(false);
      if(isDragging) setIsDragging(false);
      if(isTwoFingerDragging) {
        setDragTwoFingerStart({scale:1,dist:-1});
        setDragTwoFingerXY([{},{}]);
        setIsTwoFingerDragging(false);
      }
      if(isScaling||isDragging||isTwoFingerDragging) {
        saveStep(objectInfo);
      }
      setTouchCount(0);
    }
  }

  const handleTouchMove = (e) => {
    if(isEditing){
      handleDragTwoFinger(e);
      if(isDragging && document.getElementById(currentObject).contains(e.target))handleDragMove(e.nativeEvent.targetTouches[0]);
      else if(isScaling && e.target.dataset.type=='scale') handleScaleMove(e.nativeEvent.targetTouches[0])
   }
  } 

  const handleTouchStart = (e) => {
    if(isEditing){
      if(e.targetTouches.length==2){
        handleDragTwoFinger(e,true);
      }
      else if(touchCount==0){
        handleDragTwoFinger(e);
        if(e.target.dataset.type=='scale') handleScaleStart(e.nativeEvent.targetTouches[0]);
        if(e.target.dataset.type=='scaleText') handleScaleTextStart(e.nativeEvent.targetTouches[0]);
        else if(document.getElementById(currentObject).contains(e.target)&& e.nativeEvent.targetTouches.length==1&&touchCount==0) handleDragStart(e.nativeEvent.targetTouches[0]);
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
      if(document.getElementById(currentObject)&&document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},dragTwoFingerXY[1]];    
      else dragTwoFingerXY_ = [dragTwoFingerXY[0],{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY}]; 
    }
    else if(e.nativeEvent.targetTouches.length==2){
      if(document.getElementById(currentObject)&&document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},{x:e.nativeEvent.targetTouches[1].clientX,y:e.nativeEvent.targetTouches[1].clientY}];  
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

  const headObject = (
    <div id='headObject' className='head'
      style={{
        width:iconInfo.width,
        height:iconInfo.height,
        transform: `translate(${iconInfo.x-iconInfo.width*0.5}px, ${iconInfo.y-iconInfo.height*0.5}px) rotate(${iconInfo.rot}deg) scale(${iconInfo.scale})`,
        zIndex: frontObject=='headObject'? 99:0,
      }}
      onMouseEnter={()=>{
        if(!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
          setCurrentObject('headObject');
          setFrontObject('headObject');
          setIsEditing(true);
          console.log('enter head');
        }
      }} 
      onMouseLeave={()=>{
        if(!isScaling||isMobile) {
          setCurrentObject(null);
          setIsEditing(false);
          console.log('leave head');
        }
      }}
    >
      <div className='headImage' 
      // backgroundImage:'url('+currentIcon.url+')',transform: `scaleX(${iconInfo.flip?-1:1})`
        style={mode=='admin'?{backgroundImage:`url(${placeHolderImage})`}:{}}
      >
        {mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null}
      </div>

      {iconInfo.scale>1&&mode=='user'?(
        <div className="headImageWarningContainer" style={{width: 40/iconInfo.scale/editorScale,height: 40/iconInfo.scale/editorScale,padding: 10/iconInfo.scale/editorScale}}>
          <div className='headImageWarning' style={{borderRadius: 6/iconInfo.scale/editorScale}}>
            <Icon path={mdiExclamationThick} size={1.2/iconInfo.scale/editorScale} color="white"/>
          </div>
        </div>
      ):(null)}

      <div className={isEditing&&currentObject=='headObject'?'tools enabled ':'tools'} style={{borderWidth:3/iconInfo.scale/editorScale}}>
        <div class='dragClickArea' draggable="false" 
          style={{width:'100%',height:'100%'}} 
          onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
        />
        <div className="editButton topRightButton" data-type="scale" draggable="false" 
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

            <div className="editButton bottomRightButton" draggable="false" 
              style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
              onClick={isEditing?()=>store.dispatch({type:'UNSELECT_ICON',id:imageSelected}):null}
            >
              <Icon path={mdiDelete} size={1} color="white"/>
            </div>
          </>
        ):null}
      </div>

    </div>
  );

  const textObject = (
    <div id='textObject' className='object'
      style={{
        width:textInfo.width,
        height:textInfo.height,
        transform: `translate(${textInfo.x-textInfo.width*0.5}px, ${textInfo.y-textInfo.height*0.5}px) rotate(${textInfo.rot}deg) scale(${textInfo.scale})`,
        zIndex: frontObject=='textObject'? 99:0,
      }}
      onMouseEnter={()=>{
        if(!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
          setCurrentObject('textObject');
          setFrontObject('textObject');
          setIsEditing(true);
          console.log('enter text');
        }
      }} 
      onMouseLeave={()=>{
        if((!isScaling&&!isScalingText)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false)
          console.log('leave text');
        }
      }}
    >
      <div className='textBox' style={{transform: `scale(${textInfo.scaleX},${textInfo.scaleY})`}}>
        {/* {mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null} */}
      

        <div className={isEditing&&currentObject=='textObject'?'tools enabled ':'tools'} style={{borderWidth:3/textInfo.scale/editorScale}}>
          <div class='dragClickArea' draggable="false" 
            style={{width:'100%',height:'100%'}} 
            onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
          />
          <div className="editButton topRightButton" data-type="scale" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale/textInfo.scaleX},${1/textInfo.scale/editorScale/textInfo.scaleY})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
          >
            <Icon style={{pointerEvents:'none'}} path={mdiRotateLeft} size={1} color="white"/>
          </div>

          <div className="editButton bottomRightButton" data-type="scaleText" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale/textInfo.scaleX},${1/textInfo.scale/editorScale/textInfo.scaleY})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleTextStart(e.nativeEvent)}
          >
            <Icon path={mdiDelete} size={1} color="white"/>
          </div>
            
        </div>

      </div>

    </div>
  );

  let mouseMove = null;
  if(isDragging) mouseMove=handleDragMove;
  else if(isScaling) mouseMove=handleScaleMove;
  else if(isScalingText) mouseMove=handleScaleTextMove;

  return (
    <div id="editorContainer" 
      onMouseMove={!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchStart={isMobile?handleTouchStart:null}
      onTouchEnd={isMobile?handleEnd:null} 
    >

      {/* <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >上傳圖片以編輯</div> */}
      <TopBar stepEnabled={stepEnabled()} back={stepBack} redo={stepRedo}/>
      {imageSelected!=-1?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width,height:currentImage.height,transform: `scale(${editorScale})`}}>

          {mode=='admin' || (currentImage.iconSelected!=undefined && currentImage.iconSelected!=-1)? (
            <>
              {textObject}
              {headObject}
            </>
          ):(
            <div className={currentImage.iconSelected && currentImage.iconSelected!=-1? 'headImage hidden' : 'headImage'} 
              style={{backgroundImage:`url(${placeHolderImage})`,width:currentImage.placeHolder.width,height:currentImage.placeHolder.height,transform: `translate(${currentImage.placeHolder.x-currentImage.placeHolder.width*0.5}px, ${currentImage.placeHolder.y-currentImage.placeHolder.height*0.5}px) rotate(${currentImage.placeHolder.rot}deg) scale(${currentImage.placeHolder.scale})`}}
            >
              <p style={{fontSize:currentImage.placeHolder.width*0.1}}>請選擇頭像</p>
            </div>
          )}

          </div>
        </div>
      ):(null)}

      {mode=='user' && display!='large' ? (
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
