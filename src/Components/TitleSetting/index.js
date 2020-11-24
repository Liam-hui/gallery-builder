import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { CustomPicker } from 'react-color';
import {Services} from '../../services';

const { Saturation, Hue } = require('react-color/lib/components/common');


const inlineStyles = {
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    boxSizing: 'border-box',
    width:150,
    height:300,
    display:'flex',
    flexDirection:'column',
    '-webkit-box-shadow': 'rgba(0,0,0,0.65) 0px 0 10px',
    '-moz-box-shadow': 'rgba(0,0,0,0.65) 0px 0 10px',
    'box-shadow': 'rgba(0,0,0,0.65) 0px 0 10px',
  },
  topColor:{
    width:'100%',
    height:40,
  },
  pointer: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    transform: 'translate(-5px, -5px)',
    backgroundColor: 'rgb(248, 248, 248)',
    boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)',
  },
  fakeSlider: {
    width: '30px',
    height: '25px',
    transform: 'translateX(-15px)',
    // backgroundColor:'red',
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
    backgroundColor:'white',
    alignItems:'center',
    flexDirection:'column',
  },
  hueContainer:{
    width: '100%',
    height:40,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
  },
  hueOuter:{
    height:18,
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
    height:100,
    width:'100%',
    padding:10,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    boxSizing:'border-box',
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

function TitleSetting(props) {

  const [titleText,setTitleText] = useState(null);

  const imageSelected = useSelector(state => state.imageSelected);

  const handleTextChange = (event) => {
    setTitleText(event.target.value);
  }

  const saveTitle = () => {
    Services.titleToImage(imageSelected,titleText);
  }

  return (
    <div style={ inlineStyles.container } onClick={()=>console.log(props)}>
      <div style={{...inlineStyles.topColor,  ...{backgroundColor:props.hex} }}/>

      <div style={ inlineStyles.saturationContainer }>
        <div style={ inlineStyles.saturation }>
          <Saturation
            {...props}
            pointer={ CustomPointer }
            onChange={props.onChange}
          />
        </div>
      </div>

      <div style={inlineStyles.bottom}>

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

        <div style={inlineStyles.textEditContainer}>
          <textarea value={titleText==null?'請輸入文字':titleText} style={{color:props.color.hex}}  maxlength="80" onFocus={()=>{if(titleText==null)setTitleText('')}} onBlur={()=>{if(titleText=='')setTitleText(null)}} onChange={handleTextChange} className='textInput'></textarea>
        </div>

        {/* <div style={{width:100}}> */}
          <label className='borderBox' onClick={saveTitle} style={{width:80,fontSize:14,margin:'10px 0',padding:'3px 0',borderRadius:0}}>儲存</label>
        {/* </div> */}
       
      </div>


    </div>
  );
}

export default CustomPicker(TitleSetting);