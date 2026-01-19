// History Page Component
// STUB
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { db, GetDoc, GetDocs } from "../utils/firestore";
import { useEffect, useState } from "react";
import SiteModal from "../components/SiteModal";
import { type DocumentData } from "firebase/firestore";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function History() {
  const [visits, setVisits] = useState<any[]>([]);
  let dbVisits: DocumentData | null = null;
  useEffect(() => {
    dbVisits = GetDocs(
      "Users/7LpcmhJK1QCWn9ETqLN5/userDevices/qJDvxuD7kDWNt5EA6vJp/Visits",
    ).then((querySnapshot) => {
      let currVisits: any[] = [];
      querySnapshot.forEach((doc) => {
        currVisits.push(doc);
      });
      setVisits(currVisits);
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
