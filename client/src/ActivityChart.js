/* eslint-disable */ 
import React from 'react';
//import { PropTypes } , { Component } from 'react';
//import { render } from 'react-dom'
import { ResponsiveBar } from '@nivo/bar'

 
export default class ActivityChart extends React.Component {
  
    constructor(props) {
        super(props);
        this.state = {
                labels:[],
                series:[
                //{day:"25/5",seen:4,success:4,seenColor:'blue',successColor:"hsl(98, 70%, 50%)"},
                //{day:"24/5",seen:9,success:4,seenColor:'blue',successColor:"green"}
                ]
        } 
    }
    componentDidMount() {
           let that = this;
        //usersuccessprogress
        //useractivity
        let user = this.props.user;
        that.props.fetch('/api/useractivity?user='+this.props.user._id)
        .then(function(response) {
            return response.json()
        }).then(function(json) {
            //console.log(['got response', json]);
            let seenDateKeys={};
            let successDateKeys={};
            let now = new Date();
            let seriesObject=[];
            for (var i=0; i <=30 ; i++) {
                let key=now.getDate()+"/"+(now.getMonth()+1);
                seenDateKeys[key]=0;
                successDateKeys[key]=0;
                seriesObject[key]={day:String(key),seenColor:'blue',successColor:"green"};
                now.setDate(now.getDate()-1);
            }
            json.success.map(function(val,key) {
                //console.log(['success map',key,val]);
                let lookup=val._id.day+'/'+val._id.month;
                //if (successDateKeys[lookup]===0) {
                    //console.log(['success map r',successDateKeys[lookup],val.tally]);
                    successDateKeys[lookup]=val.tally;
                    if (seriesObject[lookup]) {
                        seriesObject[lookup].success=val.tally;
                    }
                //}
                return null;
            });
            json.seen.map(function(val,key) {
                //console.log(['seen map',key,val]);
                    
                let lookup=val._id.day+'/'+val._id.month;
                // offset seen by success to fix stacked column ratio
                //if (successDateKeys[lookup] && parseInt(successDateKeys[lookup]) > 0) {
                    //seenDateKeys[lookup]=val.tally - successDateKeys[lookup];
                //} else {
                    seenDateKeys[lookup]=val.tally;
                    if (seriesObject[lookup]) {
                        seriesObject[lookup].seen=val.tally;
                    }
                //}
                return null;
            });
            //console.log(['ACT CHART MOUNT',seriesObject]);
            // calculate awards
            //let successRateTotal=0;
            //let successRateCount=0;
            //let maxStreakDays=0;
            //let streaks=[];
            //for (var key in seriesObject) {
                //if (seriesObject[key].seen && seriesObject[key].seen > 0 && seriesObject[key].success && seriesObject[key].success > 0) {
                    //maxStreakDays++;
                    //streaks.push(maxStreakDays);
                    ////successRateTotal+=seriesObject[key].success/seriesObject[key].seen;
                    ////successRateCount++;
                //} else if (seriesObject[key].seen && seriesObject[key].seen > 0) {
                    //maxStreakDays++;
                    //streaks.push(maxStreakDays);
                //} else if (seriesObject[key].success && seriesObject[key].success > 0) {
                    //maxStreakDays++;
                    //streaks.push(maxStreakDays);
                //} else {
                    //streaks.push(maxStreakDays);
                    //maxStreakDays=0;
                //}
            //}
            console.log(['ADD STREAK AWARD ',user.streak,that.props.user])
            that.props.addAward('streak',user.streak); //Math.max(...streaks));
           // that.props.addAward('recall',successRateTotal/successRateCount);
            //json.seen//
            //console.log(['ACT CHART MOUNT',seriesObject]);
            
            that.setState({series:Object.values(seriesObject).reverse()});
                
        }).catch(function(ex) {
            //console.log(['test request failed', ex])
        })        
    };
         
    // make sure parent container have a defined height when using responsive component,
    // otherwise height will be 0 and no chart will be rendered.
    render() {
				//colors="nivo"
				//colorBy={({ id, data }) => data[`${id}Color`]}
		
        if (this.state.series && this.state.series.length > 0) {
        
            return <div style={{height: '600px'}}>
                   <h4 id="activity" className='graphTitle' >Recent Activity</h4>
                <ResponsiveBar
                data={this.state.series}
                keys={[
                    "seen",
                    "success"
                ]}
                indexBy="day"
                margin={{
                    "top": 50,
                    "right": 130,
                    "bottom": 50,
                    "left": 61
                }}
                colors={['blue','green']}
                padding={0.3}
				defs={[
                {
                    "id": "dots",
                    "type": "patternDots",
                    "background": "inherit",
                    "color": "#38bcb2",
                    "size": 4,
                    "padding": 1,
                    "stagger": true
                },
                {
                    "id": "lines",
                    "type": "patternLines",
                    "background": "inherit",
                    "color": "#eed312",
                    "rotation": -45,
                    "lineWidth": 6,
                    "spacing": 10
                }
            ]}

                borderWidth={1}
                borderColor="inherit:darker(1.6)"
                axisTop={{
                    "orient": "bottom",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 90,
                    "legend": "Tally",
                    "legendPosition": "middle",
                    "legendOffset": 46
                }}
                axisLeft={{
                    "orient": "left",
                    "tickSize": 20,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": "Date",
                    "legendPosition": "middle",
                    "legendOffset": -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="inherit:darker(1.6)"
                animate={true}
                layout="horizontal"
                motionStiffness={90}
                motionDamping={15}
                theme={{
                    "tooltip": {
                        "container": {
                            "fontSize": "13px"
                        }
                    },
                    "labels": {
                        "textColor": "#555"
                    }
                }}
            />
            </div>
        } else {
            return '';
        }
    }
}
