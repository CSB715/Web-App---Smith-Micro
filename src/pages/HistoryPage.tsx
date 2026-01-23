import {
  GetDocs,
  auth,
  CreateUser,
  GetUserDevices,
  db,
  GetDevices,
  GetVisits,
  AuthenticateUser,
} from "../utils/firestore";
import { use, useEffect, useState } from "react";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function History() {
  let userId: string;
  const [visits, setVisits] = useState<{ [key: string]: any[] }>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const nameToIdMap: { [key: string]: string } = {};
  /*useEffect(() => {
    CreateUser("user@example.com", "password123", "(111) 111-1111");
  }, []);*/
  useEffect(() => {
    //signOut(auth);
    console.log("Authenticating...");
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid);
        userId = user.uid;
        GetDevices(userId).then((devicesData) => {
          devicesData.forEach((doc) => {
            nameToIdMap[doc.data.Name] = doc.id;
          });
          console.log("Devices data:", devicesData);
          setDevices(devicesData);
          const currVisits: { [key: string]: any[] } = {};
          console.log("Selected devices:", selectedDevices);
          Promise.all(
            selectedDevices.map(async (deviceName: any) => {
              const visitsData = await GetVisits(
                userId,
                nameToIdMap[deviceName],
              );
              visitsData.forEach((doc) => {
                const date = doc.data.startDateTime.toDate();
                const key =
                  date.toDateString().slice(4, 7) +
                  " " +
                  date.getDate() +
                  " " +
                  date.getFullYear();
                try {
                  currVisits[key].push(doc.data);
                } catch {
                  currVisits[key] = [doc.data];
                }
              });
              /*GetVisits(userId, nameToIdMap[deviceName]).then((visitsData) => {
              console.log("Visits data:", visitsData);
              visitsData.forEach((doc) => {
                const date = doc.data.startDateTime.toDate();
                const key =
                  date.toDateString().slice(4, 7) +
                  " " +
                  date.getDate() +
                  " " +
                  date.getFullYear();
                try {
                  currVisits[key].push(doc.data);
                } catch {
                  currVisits[key] = [doc.data];
                }
              });
            });*/
            }),
          ).then(() => {
            console.log("CurrVisits:", currVisits);
            const sorted = Object.fromEntries(
              Object.entries(currVisits).sort(([a], [b]) => {
                return b.localeCompare(a);
              }),
            );
            console.log("Sorted Visits:", sorted);
            setVisits(sorted);
            console.log("Visits:", visits);
          });
        });
      } else {
        console.log("user not signed in");
        signInWithEmailAndPassword(auth, "user@example.com", "password123");
      }
    });
    /*AuthenticateUser("user@example.com", "password123").then((cred) => {
      console.log("user id:", cred);
      userId = cred;
      GetDevices(userId).then((devicesData) => {
        devicesData.forEach((doc) => {
          nameToIdMap[doc.data.Name] = doc.id;
        });
        console.log("Devices data:", devicesData);
        setDevices(devicesData);
        const currVisits: { [key: string]: any[] } = {};
        console.log("Selected devices:", selectedDevices);
        Promise.all(
          selectedDevices.map(async (deviceName: any) => {
            const visitsData = await GetVisits(userId, nameToIdMap[deviceName]);
            visitsData.forEach((doc) => {
              const date = doc.data.startDateTime.toDate();
              const key =
                date.toDateString().slice(4, 7) +
                " " +
                date.getDate() +
                " " +
                date.getFullYear();
              try {
                currVisits[key].push(doc.data);
              } catch {
                currVisits[key] = [doc.data];
              }
            });
            /*GetVisits(userId, nameToIdMap[deviceName]).then((visitsData) => {
              console.log("Visits data:", visitsData);
              visitsData.forEach((doc) => {
                const date = doc.data.startDateTime.toDate();
                const key =
                  date.toDateString().slice(4, 7) +
                  " " +
                  date.getDate() +
                  " " +
                  date.getFullYear();
                try {
                  currVisits[key].push(doc.data);
                } catch {
                  currVisits[key] = [doc.data];
                }
              });
            });
          }),
        ).then(() => {
          console.log("CurrVisits:", currVisits);
          const sorted = Object.fromEntries(
            Object.entries(currVisits).sort(([a], [b]) => {
              return b.localeCompare(a);
            }),
          );
          console.log("Sorted Visits:", sorted);
          setVisits(sorted);
          console.log("Visits:", visits);
        });
      });
    });*/
  }, [selectedDevices]);
  useEffect(() => {
    /*GetDocs("Users/7LpcmhJK1QCWn9ETqLN5/userDevices").then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        nameToIdMap[doc.data.deviceName] = doc.id;
      });
      setDevices(querySnapshot);
      if (selectedDevices.length === 0) {
        setVisits({});
        return;
      }
      const currVisits: { [key: string]: any[] } = {};
      Promise.all(
        selectedDevices.map(async (deviceName: any) => {
          const querySnapshot = await GetDocs(
            `Users/7LpcmhJK1QCWn9ETqLN5/userDevices/${nameToIdMap[deviceName]}/Visits`,
          );
          querySnapshot.forEach((doc) => {
            const date = doc.data.startDateTime.toDate();
            const key =
              date.toDateString().slice(4, 7) +
              " " +
              date.getDate() +
              " " +
              date.getFullYear();
            try {
              currVisits[key].push(doc.data);
            } catch {
              currVisits[key] = [doc.data];
            }
          });
        }),
      ).then(() => {
        const sorted = Object.fromEntries(
          Object.entries(currVisits).sort(([a], [b]) => {
            return b.localeCompare(a);
          }),
        );
        setVisits(sorted);
      });
    });*/
  }, [selectedDevices]);
  return (
    <>
      <h1>History Page</h1>
      <DeviceSelect devices={devices} setSelectedDevices={setSelectedDevices} />
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {Object.entries(visits).map(([key, value]) => (
          <li key={key}>
            <h2>{key}</h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {value.map((visit: any, index) => (
                <li key={index}>
                  <SiteModal url={visit.siteURL} user_id={userId} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

export default History;
