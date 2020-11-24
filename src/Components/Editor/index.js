import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import TopBar from '../../Components/TopBar';
import Icon from '@mdi/react'
import TitleSetting from '../../Components/TitleSetting';
import { mdiExclamationThick } from '@mdi/js';
import { mdiFlipHorizontal } from '@mdi/js';
import { mdiDelete } from '@mdi/js';
import { mdiArrowLeftBold } from '@mdi/js';
import { mdiRotateLeft } from '@mdi/js';
import { mdiArrowTopRightBottomLeftBold } from '@mdi/js';

import placeHolderImage from '../../placeHolderImage.png';

const PLACEHOLDER_SIZE = 350;
// let PLACEHOLDER_SCALE = 0.1;
// let EDIT_ICON_SCALE = 0.01;

function Editor(props) {
  // if(isMobile) {
  //   PLACEHOLDER_SIZE = 150;
  // }

  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

  const [editorScale,setEditorScale] = useState(1);
  const [textColor,setTextColor] = useState('#000000');

  const [currentObject,setCurrentObject] = useState(null);
  const [frontObject,setFrontObject] = useState('headObject');
  const [iconInfo,setIconInfo] = useState({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:0,y:0,rot:0,scale:1,flip:false});
  const [textInfo,setTextInfo] = useState({width:200,height:100,x:0,y:0,rot:0,scale:1,scaleX:1,scaleY:1});

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [scaleTextStart,setScaleTextStart] = useState({});
  const [dragTwoFingerXY,setDragTwoFingerXY] = useState([{},{}]);
  const [dragTwoFingerStart,setDragTwoFingerStart] = useState({scale:1,dist:-1});
  const [touchCount,setTouchCount] = useState(0);

  const [isEditing,setIsEditing] = useState(false);
  const [isDragging,setIsDragging] = useState(false);
  const [isMoved,setIsMoved] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isScalingText,setIsScalingText] = useState(false);
  const [isTwoFingerDragging,setIsTwoFingerDragging] = useState(false);
  const [isChanging,setIsChanging] = useState(false);
  const [isTextSetting,setIsTextSetting] = useState(false);

  const editor = document.getElementById('editorWindow');
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
        updateEditorTextInfo(editorScale);
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

  const updateEditorIconInfo = (editorScale_) => {
    let iconInfo = {};
    if(!editorScale_) editorScale_ = editorScale;
    if (status.mode=='admin'){
      if(currentImage.iconInfo == null) {
        let PLACEHOLDER_DISPLAY_SIZE = screen.screenWidth>768? 350:150;
        iconInfo.rot = 0;
        iconInfo.scale = PLACEHOLDER_DISPLAY_SIZE/PLACEHOLDER_SIZE/editorScale_;
        iconInfo.width = PLACEHOLDER_SIZE;
        iconInfo.height = PLACEHOLDER_SIZE;
        iconInfo.x = currentImage.width*0.5;
        iconInfo.y = currentImage.height*0.5;

        saveStep(iconInfo,'headObject');
      }
      else {
        iconInfo = currentImage.iconInfo;
        iconInfo.width = PLACEHOLDER_SIZE;
        iconInfo.height = PLACEHOLDER_SIZE;
        if(iconInfo.size) iconInfo.scale = iconInfo.size[1]/iconInfo.width;
      }
      setIconInfo(iconInfo);
    }
    else if (status.mode=='user' && currentIcon!=null) {
      if(currentImage.iconInfo == null) {
        console.log(currentImage.placeHolder);
        iconInfo.x = currentImage.placeHolder.x;
        iconInfo.y = currentImage.placeHolder.y;
        iconInfo.rot = currentImage.placeHolder.rot;
        iconInfo.width = PLACEHOLDER_SIZE;
        iconInfo.height = PLACEHOLDER_SIZE;
        iconInfo.scale = currentImage.placeHolder.size[0]/PLACEHOLDER_SIZE;
        saveStep(iconInfo,'headObject');
      }
      else iconInfo = currentImage.iconInfo;

      iconInfo.scale *= (iconInfo.width/currentIcon.width + iconInfo.height/currentIcon.height)*0.5;
      iconInfo.width = currentIcon.width;
      iconInfo.height = currentIcon.height;
      setIconInfo(iconInfo);
    }
  }

  const updateEditorTextInfo = (editorScale_) => {
    let textInfo = {};
    if(!editorScale_) editorScale_ = editorScale;

    if(status.mode=='admin'){
      if(currentImage.textInfo == null) {
        let TEXT_DISPLAY_WIDTH = screen.screenWidth>768? 350:150;
        let TEXT_WIDTH = 2000;
        let TEXT_HEIGHT = 1000;
        textInfo.rot = -20;
        textInfo.scale = TEXT_DISPLAY_WIDTH/TEXT_WIDTH/editorScale_;
        textInfo.width = TEXT_WIDTH;
        textInfo.height = TEXT_HEIGHT;
        textInfo.x = TEXT_WIDTH*textInfo.scale*0.5 + 40/editorScale;
        textInfo.y = TEXT_HEIGHT*textInfo.scale*0.5 + 70/editorScale;
        textInfo.scaleX = 1;
        textInfo.scaleY = 1;
        textInfo.title = '';

        saveStep(textInfo,'textObject');
      }
      else textInfo = currentImage.textInfo;
      setTextInfo(textInfo);
    }
    else if(status.mode=='admin'){

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
  
  //step
  const stepEnabled = () => {
    if(currentImage!=null && currentImage.step!=null){
      let initial_step = status.mode=='admin'? 2:1;
      let back = currentImage!=null && currentImage.step.store.length>initial_step && currentImage.step.current!=initial_step-1;
      let redo = currentImage!=null && currentImage.step.store.length>currentImage.step.current+1;
      return {back:back,redo:redo};
    }
    else return {back:false,redo:false}
  }

  const saveStep = (objectInfo,object) => {
    if(!object) object = currentObject;
    if(object=='headObject') store.dispatch({type:'UPDATE_ICONINFO',iconInfo:objectInfo,id:imageSelected});
    else if(object=='textObject')store.dispatch({type:'UPDATE_TEXTINFO',textInfo:objectInfo,id:imageSelected});
    
    if(object!=null){
      if(currentImage.step==null){
        store.dispatch({type:'UPDATE_STEP',step:{current:0,store:[{object:object,objectInfo:objectInfo}]},id:imageSelected});
      }
      else {
        let step = currentImage.step; 

        step.store = step.store.slice(0,step.current+1);
        step.store.push({object:object,objectInfo:objectInfo});
        step.current += 1;

        store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});

        console.log(step);
      }
    }
  }

  const stepMove = (mode) => {
    let step = currentImage.step; 
    let object,newObjectInfo;

    if(mode=='back'){
      object = step.store[step.current].object;
      newObjectInfo = step.store.slice(0,step.current).reverse().find(x=>x.object==object).objectInfo;
      step.current -= 1;
    }
    else if(mode=='redo'){
      step.current += 1;
      object = step.store[step.current].object;
      newObjectInfo = step.store[step.current].objectInfo;
    }

    if(object=='headObject') {
      setIconInfo(newObjectInfo);
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newObjectInfo,id:imageSelected});
    }
    else if(object=='textObject') {
      setTextInfo(newObjectInfo);
      store.dispatch({type:'UPDATE_TEXTINFO',textInfo:newObjectInfo,id:imageSelected});
    }

    store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
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
    console.log('asdf');
    let x = (ev.clientX - dragStart.x)/editorScale;
    let y = (ev.clientY - dragStart.y)/editorScale;
    setInfo({...objectInfo,  ...{x:dragStart.startX+x,y:dragStart.startY+y} });
   
    setIsMoved(true);
  }

  const handleScaleStart = (ev) => {
    console.log('scale start');
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
    let scaleX = 1; 
    let scaleY = 1;
    if(currentObject=='textObject') {
      scaleX = objectInfo.scaleX;
      scaleY = objectInfo.scaleY;
    }
    if (objectInfo.width*scale*scaleX*editorScale < 60 || objectInfo.height*scale*scaleY*editorScale < 60) scale = Math.max(60/objectInfo.width/scaleX/editorScale,60/objectInfo.height/scaleY/editorScale);  
    let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 - scaleStart.angle);
    setInfo({...objectInfo,  ...{rot:rot,scale:scale} });
    setIsMoved(true);
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
    if (objectInfo.width*objectInfo.scale*scaleX*editorScale < 60) scaleX = 60/objectInfo.width/objectInfo.scale/editorScale;

    let scaleY = Math.max(0.1,scaleTextStart.scaleY*distY/scaleTextStart.distY);
    if (objectInfo.height*objectInfo.scale*scaleY*editorScale < 60) scaleY = 60/objectInfo.height/objectInfo.scale/editorScale;

    setInfo({...objectInfo,  ...{scaleX:scaleX,scaleY:scaleY} });
    setIsMoved(true);
  }

  const handleTouchMove = (e) => {
    if(isEditing){
      let button = e.target.querySelector('.editButton');
      handleDragTwoFinger(e);
      if(isDragging && document.getElementById(currentObject).contains(e.target))handleDragMove(e.nativeEvent.targetTouches[0]);
      else if(isScaling && e.target.dataset.type=='scale') handleScaleMove(e.nativeEvent.targetTouches[0])
      else if(isScalingText && e.target.dataset.type=='scaleText') handleScaleTextMove(e.nativeEvent.targetTouches[0])
   }
  } 

  const handleTouchStart = (e) => {
    if(isEditing){
      let button = e.target.querySelector('.editButton');
      if(button) console.log(button.dataset.type);
      if(e.targetTouches.length==2){
        handleDragTwoFinger(e,true);
      }
      else if(touchCount==0){
        handleDragTwoFinger(e);
        if(e.target.dataset.type=='scale') handleScaleStart(e.nativeEvent.targetTouches[0]);
        else if(e.target.dataset.type=='scaleText') handleScaleTextStart(e.nativeEvent.targetTouches[0]);
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
        scale:objectInfo.scale,
        dist: Math.hypot(dragTwoFingerXY_[0].x-dragTwoFingerXY_[1].x,dragTwoFingerXY_[0].y-dragTwoFingerXY_[1].y)
      });
    }
  }

  useEffect(() => {
    if(isTwoFingerDragging) {
      let dist = Math.hypot(dragTwoFingerXY[0].x-dragTwoFingerXY[1].x,dragTwoFingerXY[0].y-dragTwoFingerXY[1].y);
      let scale = dragTwoFingerStart.scale*dist/dragTwoFingerStart.dist;
      setInfo({...objectInfo,  ...{scale:scale} });
      setIsMoved(true);
    }
  }, [dragTwoFingerXY]);

  const handleFlip = () => {
    if(isEditing){
      let iconInfo_ = {width:objectInfo.width,height:objectInfo.height,x:objectInfo.x,y:objectInfo.y,rot:objectInfo.rot,scale:objectInfo.scale,flip:!objectInfo.flip};
      setInfo(iconInfo_);
      saveStep(iconInfo_);
    }
  }
  
  const handleEnd = () => {
    console.log('end');
    if(isEditing){   
      if(isMoved) {
        saveStep(objectInfo);
      }
      else if(isDragging){
        if(frontObject=='textObject')setIsTextSetting(!isTextSetting);
      }
      setIsScaling(false);
      setIsScalingText(false);
      setIsDragging(false);
      if(isTwoFingerDragging) {
        setDragTwoFingerStart({scale:1,dist:-1});
        setDragTwoFingerXY([{},{}]);
        setIsTwoFingerDragging(false);
      }
      setIsMoved(false);
      setTouchCount(0);
    }
  }

  const test = "data:image/jpg;base64,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";

  const headObject = (
    <div id='headObject' className='object'
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
        if((!isDragging&&!isScaling&&!isScalingText)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false);
          console.log('leave head');
        }
      }}
    >
      <div className='headImage' 
        style={status.mode=='admin'||currentIcon==null?{backgroundImage:`url(${placeHolderImage})`}:{backgroundImage:'url('+currentIcon.url+')',transform: `scaleX(${iconInfo.flip?-1:1})`}}
      >
        {status.mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null}
      </div>

      {iconInfo.scale>1&&status.mode=='user'?(
        <div className="headImageWarningContainer" style={{width: 40/iconInfo.scale/editorScale,height: 40/iconInfo.scale/editorScale,padding: 10/iconInfo.scale/editorScale}}>
          <div className='headImageWarning' style={{borderRadius: 6/iconInfo.scale/editorScale}}>
            <Icon path={mdiExclamationThick} size={1.2/iconInfo.scale/editorScale} color="white"/>
          </div>
        </div>
      ):(null)}

      <div className={isEditing&&currentObject=='headObject'?'tools enabled ':'tools'} style={{borderWidth:1.5/iconInfo.scale/editorScale}}>
        <div class='dragClickArea' draggable="false" 
          style={{width:'100%',height:'100%'}} 
          onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
        />
        <div className="editButton topRightButton" data-type="scale" draggable="false" 
          style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
          onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
        >
          <div className="editButtonInner" style={{pointerEvents:'none'}}>
            <Icon path={mdiRotateLeft} size={1} color="white"/>
          </div>
        </div>
        {status.mode=='user'?(
          <>
            <div className="editButton" id='flipButton' draggable="false" 
              style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
              onClick={isEditing?handleFlip:null}
            >
              <div className="editButtonInner">
                <Icon style={{pointerEvents:'none'}} path={mdiFlipHorizontal} size={1} color="white"/>
              </div>
            </div>

            <div className="editButton bottomRightButton" draggable="false" 
              style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
              onClick={isEditing?()=>store.dispatch({type:'UNSELECT_ICON',id:imageSelected}):null}
            >
              <div className="editButtonInner" style={{pointerEvents:'none'}}>
                <Icon path={mdiDelete} size={1} color="white"/>
              </div>
            </div>
          </>
        ):null}
      </div>

    </div>
  );

  const textObject = (
    <div id='textObject' className='textObject object'
      style={{
        width:textInfo.width,
        height:textInfo.height,
        transform: `translate(${textInfo.x-textInfo.width*0.5}px, ${textInfo.y-textInfo.height*0.5}px) rotate(${textInfo.rot}deg) scale(${textInfo.scale*textInfo.scaleX},${textInfo.scale*textInfo.scaleY})`,
        zIndex: frontObject=='textObject'? 99:0,
        backgroundImage: currentImage.textInfo.image==null? 'none': 'url('+currentImage.textInfo.image.url+')',
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
        if((!isDragging&&!isScaling&&!isScalingText)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false)
        }
      }}
    >
      <div className='textBox'>
        {/* {status.mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null} */}

        <div className={isEditing&&currentObject=='textObject'?'tools enabled ':'tools'} 
          // style={{borderWidth:`${3/textInfo.scale/textInfo.scaleY/editorScale}px ${3/textInfo.scale/textInfo.scaleX/editorScale}px`}}
        >
          <div class='dragClickArea' draggable="false" 
            style={{width:'100%',height:'100%'}} 
            onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
          />
          <div className="editButton topRightButton" data-type="scale" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale/textInfo.scaleX},${1/textInfo.scale/editorScale/textInfo.scaleY})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}} >
              <Icon path={mdiRotateLeft} size={1} color="white"/>
            </div>
          </div>

          <div className="editButton bottomRightButton" data-type="scaleText" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale/textInfo.scaleX},${1/textInfo.scale/editorScale/textInfo.scaleY})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleTextStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}}>
              <Icon path={mdiArrowTopRightBottomLeftBold} size={0.7} color="white"/>
            </div>
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
    <div id="editorContainer" style={{"--button-size":isMobile?'40px':'30px'}}
      onMouseMove={!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchStart={isMobile?handleTouchStart:null}
      onTouchEnd={isMobile?handleEnd:null} 
    >

      {status.mode=='admin'? 
        <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >請上傳圖片</div>
      :null}
      <TopBar stepEnabled={stepEnabled()} back={()=>{if(stepEnabled().back)stepMove('back')}} redo={()=>{if(stepEnabled().redo)stepMove('redo')}}/>
      {currentImage!=null?(
          <div id='editorWindow'>
            <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width,height:currentImage.height,transform: `scale(${editorScale})`}}>
              
              {/* text setting */}
              <div className={isTextSetting?'textSetting object':'textSetting object hidden'}
                style={{
                  transform: `translate(${textInfo.x}px, ${textInfo.y}px) scale(${1/editorScale})`,     
                }}
              >
                <TitleSetting color={textColor} title={currentImage.textInfo==null?'':currentImage.textInfo.title} onChange={(color)=>setTextColor(color)} />
              </div>

              <div className='editorOverflowContainer'>

                {/* text */}
                {status.mode=='admin'? (
                    <>{textObject}</>
                  ):(
                    <div className='textBox' style={{
                      width:currentImage.textBox.width,
                      height:currentImage.textBox.height,
                      transform: `translate(${currentImage.textBox.x-currentImage.textBox.width*0.5}px, ${currentImage.textBox.y-currentImage.textBox.height*0.5}px) rotate(${currentImage.textBox.rot}deg)`,
                    }}>
                      <input className='textInput' type="text" id="fname" name="fname"></input>
                    </div>
                )}

                {/* head */}
                {status.mode=='admin' || (currentImage.iconSelected!=undefined && currentImage.iconSelected!=-1)? (
                  <>{headObject}</>
                ):(
                  <div className={currentImage.iconSelected && currentImage.iconSelected!=-1? 'headImage hidden' : 'headImage'} 
                    style={{backgroundImage:`url(${placeHolderImage})`,width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,transform: `translate(${currentImage.placeHolder.x-PLACEHOLDER_SIZE*0.5}px, ${currentImage.placeHolder.y-PLACEHOLDER_SIZE*0.5}px) rotate(${currentImage.placeHolder.rot}deg) scale(${currentImage.placeHolder.size[0]/PLACEHOLDER_SIZE})`}}
                  >
                    <p style={{fontSize:currentImage.placeHolder.width*0.1}}>請選擇頭像</p>
                  </div>
                )}

              </div>

            </div>
          </div>
      ):(
        <div style={{flex:1}}/>
        )
      }

      {status.mode=='user' && display!='large' ? (
        <div className='editorBottom'>
          <div className={currentImageIndex>0?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex>0){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex-1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} rotate={0} color="#DDDDDD" style={{transform:`translate(0px,0.5px)`}}/>
          </div>

          <div className='pageNumber borderBox'>第 {currentImageIndex+1} 張</div>
          
          <div className={currentImageIndex<images.length-1?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex<images.length-1){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex+1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{transform:`translate(0px,0.5px) rotate(180deg)`}}/>
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}

export default Editor;
