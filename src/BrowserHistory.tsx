import SiteModal from "./Components/SiteModal";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, child, get, type DatabaseReference } from "firebase/database";

export default function BrowserHistory() {
  const [user, setUser] = useState<DatabaseReference>({} as DatabaseReference);

  useEffect(() => {
    const path = `users/1`;

    const nodeRef = ref(db, path);
    get(nodeRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          console.debug("No data available at", path);
        }
      })
      .catch((error) => {
        console.error("Realtime DB get() error:", error);
      });
  }, []);
  return (
    <>
      <SiteModal url={"amazon.com"} user={user} />
    </>
  );
}
