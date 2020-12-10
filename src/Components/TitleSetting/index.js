import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { CustomPicker } from 'react-color';
import {Services} from '../../services';
import {isMobile} from 'react-device-detect';
import store from '../../store';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';

const { Saturation, Hue } = require('react-color/lib/components/common');

const inlineStyles = {

  container: {
    borderRadius: 14,
    overflow: 'hidden',
    boxSizing: 'border-box',
    width:150,
    display:'flex',
    flexDirection:'column',
    '-webkit-box-shadow': 'rgba(0,0,0,0.45) 0px 0 10px',
    '-moz-box-shadow': 'rgba(0,0,0,0.45) 0px 0 10px',
    'box-shadow': 'rgba(0,0,0,0.45) 0px 0 10px',
    position:'relative',
  },
  mobileContainer:{
    border:'1px solid black',
    boxSizing: 'border-box',
    display:'flex',
    flexDirection:'column',
    position:'relative',
    width:300,
    overflowY:'scroll',
    backgroundColor:'white',
  },
  outer:{
    transform: 'translate(24px,-17px)',
  },
  topColor:{
    width:'100%',
    height:50,
  },
  topColorMobile:{
    width:'100%',
    height:45,
    display:'flex',
    alignItems:'center',
  },
  pointer: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    transform: 'translate(-5px, -8px)',
    backgroundColor: 'rgb(248, 248, 248)',
    boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)',
  },
  fakeSlider: {
    width: '30px',
    height: '25px',
    transform: 'translateX(-15px)',
    // backgroundColor:'black',
  },
  slider: {
    position:'absolute',
    left:0,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    boxShadow: '0 0 2px rgba(0, 0, 0, .6)',
    background: '#fff',
    pointerEvents:'none',
  },
  saturationContainer:{
    overflow:'hidden',
  },
  saturation: {
    width: '100%',
    backgroundColor:'black',
    paddingBottom: '75%',
    position: 'relative',
    overflow: 'hidden',
  },
  bottom:{
    display:'flex',
    flex:1,
    alignItems:'center',
    flexDirection:'column',
    backgroundColor:'white'
  },
  hueContainer:{
    width: '100%',
    height:isMobile?50:40,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
  },
  hueOuter:{
    height:isMobile?27:18,
    width: 130,
  },
  hue: {
    height:'100%',
    width: '100%',
    position: 'relative',
    borderRadius:5,
    overflow:'hidden',
  },
  textEditContainer:{
    height:isMobile?'100%':80,
    width:isMobile&&store.getState().status.mode=='admin'?'90%':'100%',
    marginLeft:'auto',
    marginRight:'auto',
    padding:10,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    boxSizing:'border-box',
    fontSize:16,
    border: isMobile&&store.getState().status.mode=='admin'? '1px solid black':'unset',
  },
  middleText:{
    fontSize:14,
    width:'100%',
    padding:4,
    display:'flex',
    alignItems:'center',
    boxSizing:'border-box',
  },
  arrow:{
    position:'absolute',
    top:0,
    left:0,
    transform: 'translate(-24px,17px)',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '12px 26px 12px 0',
  },
  bottomSaveButton:{
    height:isMobile? 40:30,
    width:'100%',
    backgroundColor:'black',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginTop: 'auto'
  }
}

const CustomSlider = () => {
  return (
    <div style={ inlineStyles.fakeSlider }/>
  )
}

const CustomPointer = () => {
  return (
    <div style={ inlineStyles.pointer } />
  )
}

function TitleSettingComponent(props) {

  const [titleText,setTitleText] = useState(null);
  const [showText,setShowText] = useState('');

  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const screen = useSelector(state => state.screen);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const currentImage = imageSelected==-1? null:images.find(image => image.id == imageSelected);

  useEffect(() => {
    if(status.mode=='admin'&&currentImage.textInfo&&currentImage.textTitle) {
      setTitleText(currentImage.textTitle);
      setShowText(Services.realText(currentImage.textTitle,'{顧客輸入}'));
    }
    else if(status.mode=='user'&&currentImage.textInfo&&currentImage.textInfo.adminTitle) {
      setTitleText(null);
      setShowText('');
    }
    else {
      setTitleText(null);
      setShowText('');
    }
    if(currentImage&&currentImage.textInfo&&currentImage.textInfo.color) props.onChange(currentImage.textInfo.color);
    else props.onChange('#000000');
  }, [props.on]);

  const textPart = (full,find) => {
    let start_pos = full.indexOf(find);
    let end_pos = start_pos + find.length;
    return [full.substr(0,start_pos),full.substr(end_pos,full.length-end_pos)];
  }

  const handleTextChange = (event) => {
   
    let customer_text = '{**Customer_INPUT**}';
    
    let titleTextPart = textPart(titleText,customer_text);
    let showTextPart = textPart(event.target.value,'{顧客輸入}');

    if(status.mode=='admin'&& event.target.value.includes('{顧客輸入}') && (titleTextPart[0]==showTextPart[0]||titleTextPart[1]==showTextPart[1] )){
      setShowText(event.target.value);
      setTitleText(showTextPart[0]+customer_text+showTextPart[1])
    }

    else if(status.mode=='user'){
      setShowText(event.target.value);
      setTitleText(event.target.value);
    }

  }

  const saveTitle = () => {
    if(isMobile) store.dispatch({type:'CLOSE_OVERLAY'});
    else props.toggle(false);
    store.dispatch({type:'TITLE_IMAGE_LOADING',id:imageSelected});
    if(status.mode=='admin'){
      Services.adminUpdatePhotos(
        [currentImage],
        // () => setTimeout( ()=>{
        //     Services.titleToImage(imageSelected,titleText);
        //     props.toggle(false);
        //   }
        //   ,0),
        () => {
          Services.titleToImage(imageSelected,titleText);
        },
        props.hex
      );
    }
    else if(status.mode=='user') Services.titleToImage(imageSelected,Services.realText(currentImage.textInfo.adminTitle,titleText));
  }

  let mobileWidth = display=='smallLand'?screen.screenWidth*0.4:screen.screenWidth*0.75;

  if(!isMobile)return (
    <div id='titleSetting' style={isMobile?null:inlineStyles.outer}>


      <div style={inlineStyles.container}>

        <div className='closeTextSetting' onClick={()=>{props.toggle(false);}}>
          <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.65} color="#DDDDDD"/>
        </div>

        <div style={{...inlineStyles.topColor,  ...{backgroundColor:props.hex} }}/>

        <div style={{backgroundColor:'white',height:isMobile?'20%':'unset'}}>
          <div style={inlineStyles.textEditContainer}>
            <textarea value={titleText==null?'請輸入文字':showText}  maxLength="80" onFocus={()=>{if(titleText==null)setTitleText('')}} onBlur={()=>{if(titleText=='')setTitleText(null)}} onChange={handleTextChange} className='textInput'></textarea>
          </div>
        </div>

        {status.mode=='admin'?
          <div style={ inlineStyles.saturationContainer }>
            <div style={ inlineStyles.saturation }>
              <Saturation
                {...props}
                pointer={ CustomPointer }
                onChange={props.onChange}
              />
            </div>
          </div>
        :null}

        <div style={inlineStyles.bottom}>
          {status.mode=='admin'?
            <div style={inlineStyles.hueContainer}>
              <div style={inlineStyles.hueOuter}>
                <div style={inlineStyles.hue}>
                  <Hue
                    {...props}
                    pointer={ CustomSlider }
                    onChange={props.onChange}
                    direction={'horizontal'}
                  />
                </div>
              </div>
              <div style={{...inlineStyles.slider,  ...{transform:`translateX(${8+props.oldHue/360*116}px)`}}}/>
            </div>
          :null}

          <div style={inlineStyles.bottomSaveButton} onClick={saveTitle}>
            <div className="bottomSaveButtonText">儲存</div>
          </div>

        </div>

      </div>
      <div style={{...inlineStyles.arrow,  ...{borderColor: 'transparent '+props.hex+' transparent transparent'} }}/>
    </div>
  );

  else return(
    <div id='titleSetting' style={{...inlineStyles.mobileContainer,  ...{width:mobileWidth,height:status.mode=='admin'?screen.screenHeight*0.7:300}}}>

      <div style={{...inlineStyles.topColorMobile,  ...{backgroundColor:props.hex} }}>
        <div className='closeTextSettingMobile flexCenter' onClick={()=>{store.dispatch({type:'CLOSE_OVERLAY'});}}>
          <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.65} color="#DDDDDD"/>
        </div>
      </div>

      {status.mode=='admin'?
        <>
        <div style={ inlineStyles.saturationContainer }>
          <div style={ inlineStyles.saturation }>
            <Saturation
              {...props}
              pointer={ CustomPointer }
              onChange={props.onChange}
            />
          </div>
        </div>

        <div style={inlineStyles.hueContainer}>
          <div style={{...inlineStyles.hueOuter,...{width:mobileWidth*0.8}}}>
            <div style={inlineStyles.hue}>
              <Hue
                {...props}
                pointer={ CustomSlider }
                onChange={props.onChange}
                direction={'horizontal'}
              />
            </div>
          </div>
          <div style={{...inlineStyles.slider,  ...{transform:isMobile?`translateX(${22+props.oldHue/360*(mobileWidth*0.78)}px)`:`translateX(${8+props.oldHue/360*116}px)`}}}/>
        </div>
        </>
      :null}

      <div style={{backgroundColor:'white',height:isMobile? status.mode=='admin'?'20%':220:'unset'}}>
        <div style={inlineStyles.textEditContainer}>
          <textarea value={titleText==null?'請輸入文字':showText}  maxLength="80" onFocus={()=>{if(titleText==null)setTitleText('')}} onBlur={()=>{if(titleText=='')setTitleText(null)}} onChange={handleTextChange} className='textInput'></textarea>
        </div>
      </div>

      <div style={inlineStyles.bottomSaveButton} onClick={saveTitle}>
        <div className="bottomSaveButtonText">儲存</div>
      </div>

    </div>

  )
}

const TitleSettingRender = CustomPicker(TitleSettingComponent);

export default function TitleSetting(props) {
  const [textColor,setTextColor] = useState('#000000');

  const editor = document.getElementById('titleSetting');
  if(editor) editor.addEventListener('touchmove', e => {
      e.preventDefault();
  }, { passive: false });

  return <TitleSettingRender {...props} color={textColor} onChange={setTextColor}/>
}