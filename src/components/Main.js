require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imageData = require('../data/image.json');

imageData = (function genImgUrl(imageArr) {
  for (var i = 0, len = imageArr.length; i < len; i++) {
    var entry = imageArr[i];
    entry.url = require('../data/' + entry.filename);
  }
  return imageArr;
}(imageData));


class GalleryByReact extends React.Component {
  constructor(props) {
    super(props);
    this.config = {
      centerPos: {
        left: 0,
        top: 0
      },
      //左右两侧范围
      hPosRange: {
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      //上部范围
      vPosRange: {
        x: [0, 0],
        y: [0, 0]
      }
    };
    this.rearrange = function (centerIndex) {
      let imgArrangeArr = this.state.imgArrangeArr,
        config = this.config,
        centerPos = config.centerPos,
        hPosRange = config.hPosRange,
        vPoseRange = config.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeY = vPoseRange.y,
        vPosRangeX = vPoseRange.x,

        imgArrangeCenterArr = imgArrangeArr.splice(centerIndex, 1);

      let topImgNum = Math.floor(Math.random() * 2),//一个或零个
        topImgSpliceindex = Math.floor(Math.random() * (imgArrangeArr.length - topImgNum)),
        imgRangeTopArr = imgArrangeArr.splice(topImgSpliceindex, topImgNum);

      imgArrangeCenterArr[0] = {pos: centerPos, rotate: 0, isInverse: false, isCenter: true};

      imgRangeTopArr.forEach((value, index)=> {
        imgRangeTopArr[index] = {
          pos: {
            top: this.getRangeRandom(vPosRangeY[0], vPosRangeY[1]),
            left: this.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
          },
          rotate: this.get30DegreeRandom(),
          isInverse: false,
          isCenter: false
        }
      });

      for (let i = 0, len = imgArrangeArr.length, k = len / 2; i < len; i++) {
        let hPosRangeLORX = null;
        if (i < k) {
          hPosRangeLORX = hPosRangeLeftSecX
        } else {
          hPosRangeLORX = hPosRangeRightSecX
        }
        imgArrangeArr[i] = {
          pos: {
            left: this.getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]),
            top: this.getRangeRandom(hPosRangeY[0], hPosRangeY[1])
          },
          rotate: this.get30DegreeRandom(),
          isInverse: false,
          isCenter: false
        }
      }

      if (imgRangeTopArr && imgArrangeArr[0]) {
        imgArrangeArr.splice(topImgSpliceindex, 0, imgRangeTopArr[0])
      }

      imgArrangeArr.splice(centerIndex, 0, imgArrangeCenterArr[0]);
      this.setState({
        imgArrangeArr: imgArrangeArr
      })

    };
    this.getRangeRandom = function (low, high) {
      return Math.ceil(Math.random() * (high - low) + low)
    };
    this.get30DegreeRandom = function () {
      return Math.ceil(Math.random() * 60) - 30
    };
    this.inverse = function (index) {
      return function () {
        let imgArangeArr = this.state.imgArrangeArr;
        imgArangeArr[index].isInverse = !imgArangeArr[index].isInverse;
        this.setState({imgArangeArr: imgArangeArr})
      }.bind(this)
    };
    this.center = function (centerIndex) {
      return function () {
        this.rearrange(centerIndex)
      }.bind(this)
    };
    this.state = {
      imgArrangeArr: []
    }
  };


  componentDidMount() {
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW = imgFigureDOM.scrollWidth,
      imgH = imgFigureDOM.scrollHeight,
      halfImgW = Math.ceil(imgW / 2),
      halfImgH = Math.ceil(imgH / 2);
    let _config = {
      centerPos: {
        left: halfStageW - halfImgW,
        top: halfStageH - halfImgH
      },
      hPosRange: {
        leftSecX: [-halfImgW, halfStageW - halfImgW * 3],
        rightSecX: [halfStageW + halfImgW, stageW - halfImgW],
        y: [-halfImgH, stageH - halfImgH]
      },
      vPosRange: {
        x: [halfStageW - imgW, halfStageW],
        y: [-halfImgH, halfStageH - 3 * halfImgH]
      }
    };
    Object.assign(this.config, _config);

    this.rearrange(0);
    //window.addEventListener("resize", this.componentDidMount.bind(this));

  }

  render() {
    let controllerUnits = [];
    let imgFigures = [];
    imageData.forEach((value, index)=> {
      this.state.imgArrangeArr[index] = this.state.imgArrangeArr[index] || {pos: {left: 0, top: 0}, rotate: 0, isInverse: false, isCenter: false};

      imgFigures.push(<ImgFigure data={value} arrange={this.state.imgArrangeArr[index]} ref={"imgFigure"+index} key={"imgFigure"+index}
                                 inverse={this.inverse(index)} center={this.center(index)}/>);

      controllerUnits.push(<ControllerUnit arrange={this.state.imgArrangeArr[index]} key={"controllerUnit"+index} inverse={this.inverse(index)}
                                           center={this.center(index)}/>)

    });

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

class ImgFigure extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = function (e) {
      if (this.props.arrange.isCenter) {
        this.props.inverse();
      } else {
        this.props.center();
      }

      e.stopPropagation();
      e.preventDefault();
    }.bind(this)
  }

  render() {
    let styleObj = {},
      imgFigureClassName = 'image-figure';

    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    if (this.props.arrange.rotate) {
      ['Webkit', 'ms', 'Moz', ''].forEach((value)=> {
        styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)'
      });
    }
    if (this.props.arrange.isInverse) {
      imgFigureClassName += ' is-inverse';
    }
    if (this.props.arrange.isCenter) {
      styleObj['zIndex'] = 11;
    }
    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.url} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="image-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figcaption>
      </figure>
    )
  }
}

class ControllerUnit extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = function (e) {
      if (this.props.arrange.isCenter) {
        this.props.inverse();
      } else {
        this.props.center();
      }

      e.stopPropagation();
      e.preventDefault();
    }.bind(this)
  }


  render() {
    let controllerUnitClass = 'controller-unit';

    if (this.props.arrange.isCenter) {
      controllerUnitClass += ' is-center';
      if (this.props.arrange.isInverse) {
        controllerUnitClass += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClass} onClick={this.handleClick}></span>
    )

  }
}
GalleryByReact.defaultProps = {};
ReactDOM.render(<GalleryByReact/>, document.getElementById('content'));

export default GalleryByReact;
