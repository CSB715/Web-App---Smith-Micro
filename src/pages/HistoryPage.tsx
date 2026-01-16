// History Page Component
// STUB
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { db, GetDoc } from "../utils/firestore";
import { useEffect, useState } from "react";
import SiteModal from "../components/SiteModal";
import { type DocumentData } from "firebase/firestore";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function History() {
  const [visits, setVisits] = useState<any[]>([]);
  let data: DocumentData | null = null;
  useEffect(() => {
    data = GetDoc(
      "Users/7LpcmhJK1QCWn9ETqLN5/userDevices/qJDvxuD7kDWNt5EA6vJp/Visits/RTYFYd2QQR1yWqwWDGuU",
    ).then((docSnap) => {
      if (docSnap) {
        console.log("Document data:", docSnap);
        setVisits([docSnap] as any[]);
      } else {
        console.log("No such document!");
      }
    });
  }, []);
  return (
    <>
      <h1>History Page - Stub</h1>
      {/* History Page Content */}
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {visits.map((visit: any, index) => (
          <li key={index}>
            <SiteModal url={visit.siteURL} user_id={"7LpcmhJK1QCWn9ETqLN5"} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default History;
