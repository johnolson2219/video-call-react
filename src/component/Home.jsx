import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"


const socket=io.connect("https://react-video-chat-atanu.herokuapp.com/");

const Home = () => {
//   const [call, setCall] = useState()

    const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")

	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

    useEffect(()=>{
        navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
            setStream(stream)
            myVideo.current.srcObject=stream
        })

        socket.on("me",(id)=>{
            setMe(id)
        })
        socket.on("callUser",(data)=>{
            setReceivingCall(true)
            setCaller(data.from)
            setName(data.name)
            setCallerSignal(data.signal)

        })

    },[])


    const callUser=(id)=>{
        const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})

        peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
        peer.on("stream", (stream) => {
			
            userVideo.current.srcObject = stream
        
        })
            socket.on("callAccepted", (signal) => {
                setCallAccepted(true)
                peer.signal(signal)
            })

            connectionRef.current=peer
    }

    const answerCall=()=>{
        setCallAccepted(true)
        const peer=new Peer({
            initiator:false,
            trickle:false,
            stream:stream
        })
        peer.on("signal",(data)=>{
            socket.emit("answerCall",{signal:data,to:caller})
        })

        peer.on("stream", (stream) => {
			
            userVideo.current.srcObject = stream
        
        })
        peer.signal(callerSignal)
        connectionRef.current=peer

    }

const leaveCall=()=>{
    setCallEnded(true)
    connectionRef.current.destroy()
}


    
// const callNow=(e)=>{
//     e.preventDefault()
//     console.log("hi")
// }
    return (
        <>
            <div className="home">
                <div className="user">
                    {
                        callAccepted && !callEnded ?
                        <video playsInline ref={userVideo} autoPlay  />:
                        null

                    }


                </div>
                <div className="my">
                {
                    
                    stream && <video playsInline  ref={myVideo} autoPlay style={{width:'100%',height:'80vh'}} />
                    }

                </div>

            
            </div>
            <div className="container">
                <div className="row">
                <div className="col-md-6 col-11 mx-auto">
                    <div className="pt-3">
                    <form   className="pt-3">
                    <div className="form-group">
                   
                        <input type="text" className="form-control" placeholder="Enter Your Name" name="name" value={name} onChange={(e)=>setName(e.target.value)}  />
                        </div>
                        
 
                </form>
                <CopyToClipboard  text={me}>
                <button className="btn btn-primary btn-block ">Copy Your Id</button>

                </CopyToClipboard> 
               
                    
                    
                    </div>
                </div>
                    <div className="col-md-6 col-11 mx-auto">
                 {/* <form   className="pt-3" > */}
                    <div className="form-group pt-3">
                   
                        <input type="text" className="form-control" placeholder="Enter ID To Call SomeOne" name="callid" value={idToCall} onChange={(e)=>setIdToCall(e.target.value)}  />
                        </div>
                        
 
                     <button className="btn btn-primary" onClick={() => callUser(idToCall)}>Call User</button>
                {/* </form> */}
                <br />
                <div className="card">
                {callAccepted && !callEnded ? (
						<button className="btn btn-primary" onClick={leaveCall} >
							End Call
						</button>
					) :null}
					{idToCall}
                </div>
                       
                    </div>
                </div>
                <br /><br />
                <div className="row  admit">
                    <div className="col-md-6 col-12 mx-auto">
                        

                            

                            {receivingCall && !callAccepted ? ( <>
                                <div className="card">
						
                    <h4>{name} is Calling...</h4>
                             
                    <button className="btn btn-primary" onClick={answerCall}>Admit</button>
                    </div>
                    </>
				) : null}
                        
                    </div>
                </div>
                <br /><br /><br />
            </div>
            
        </>
    )
}

export default Home


