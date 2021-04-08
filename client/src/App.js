import React, {useEffect, useState} from "react";
import './App.css';
import axios from "axios";

const App = () => {

  const [shortcutLink, setShortcutLink] = useState("")
  const [updateDate, setUpdateDate] = useState("")

  useEffect(() => {
    let baseUrl

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      baseUrl =  "http://localhost:2004"
    } else {
      baseUrl = ""
    }

    axios.get(baseUrl + "/api/getLastShortcut")
        .then(({data}) => {
          setShortcutLink(data.shortcut)
          setUpdateDate(data.updateDate)
        })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Raccourci attestation covid</h1>
        {shortcutLink !== "" &&
          <a
              className="btn btn-lg"
              href={shortcutLink}
              target="_blank"
              rel="noopener noreferrer"
          >
            Obtenir le raccourci
          </a>
        }
        <p>Mis à jour le : {updateDate}</p>
        <p>
          Code source :&nbsp;
          <a
              className="App-link"
              href="https://github.com/Les-Cop1/covid-attestation"
              target="_blank"
              rel="noopener noreferrer"
          >
            https://github.com/Les-Cop1/covid-attestation
          </a>
        </p>
      </header>
    </div>
  );
}

export default App;
