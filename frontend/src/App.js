import React, { useEffect, useRef, useState } from "react"
import {
  Container, Form, FormGroup,
  Input, Button, CardBody, Card,
  CardSubtitle
} from "reactstrap"
import Pusher from "pusher-js"
import 'bootstrap/dist/css/bootstrap.min.css';
import Excel from "./utils/Excel";

function App() {
  const inputFile = useRef(null)
  const [file, setFile] = useState();
  const [showProgressPercente, setShowProgressPercente] = useState(false)
  const [percente, setPercente] = useState(0)

  const changeFile = (e) => {
    setFile(e.target.files[0])
  }

  const processExcel = async (event) => {
    event.preventDefault()
    let uid = null;
    let stepImportationExcel = 1;
    const data = await Excel.read(inputFile.current.files[0]);
    let dataToSend = []
    for (let indice = 0; indice < data.body.length; indice++) {
      const item = data.body[indice];
      const isEqual100Items = dataToSend.length === 1000
      const isLastItem = (indice == data.body.length - 1)
      if (!isEqual100Items && !isLastItem) {
        dataToSend.push(item)
        continue;
      }


      const mappedDataToJson = []
      dataToSend.map(item => {
        const dataJson = {}
        item.forEach((value, index) => {
          dataJson[data.headers[index]] = value
        })
        mappedDataToJson.push(dataJson)
      })


      const response = await fetch(process.env.REACT_APP_API_BASE + "/imports-data", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalSteps: data.totalSteps,
          uid, stepImportationExcel,
          data: mappedDataToJson
        })
      })
      const dataReturned = await response.json()
      uid = dataReturned.uid;
      stepImportationExcel += 1;
      dataToSend = []
    }
    setShowProgressPercente(true);
    inputFile.current.value = ''
  }

  useEffect(() => {
    Pusher.logToConsole = true;

    var pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function (data) {
      setPercente(data.message.percenteImportationExcel)
      if (data.message.percenteImportationExcel == 100) {
        setFile(null)
        setTimeout(() => {
          setShowProgressPercente(false);
          setPercente(0)
        }, 3000)
      }
    });

    return () => channel.cancelSubscription()
  }, [])

  return (
    <Container>
      <Form>
        <FormGroup>
          <input type="file" ref={inputFile}/>
        </FormGroup>
        <FormGroup>
          <Button onClick={processExcel}>Importar excel</Button>
        </FormGroup>
      </Form>
      <div>
        {showProgressPercente &&
          <Card
          >
            <CardBody>
              <CardSubtitle
                className="mb-2 text-muted text-center mt-2 mb-2"
                tag="h2"
              >
                Importação do excel {percente}%
            </CardSubtitle>
            </CardBody>
          </Card>
        }

      </div>
    </Container>
  );
}

export default App;
