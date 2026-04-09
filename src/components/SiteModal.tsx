import {
  Autocomplete,
  Modal,
  Button,
  Box,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  GetCategorization,
  GetOverride,
  WriteOverride,
  GetDevices,
  GetCategories,
} from "../utils/firestore";
import DeviceSelect from "./DeviceSelect";
import {
  type Categorization,
  type Override,
  type Device,
} from "../utils/models";
import { getDisplayUrl } from "../utils/urls";
import { classifyURL } from "../utils/classifier";
import { getAuthInstance } from "../utils/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function SiteModal({
  url,
  isOpen,
  closeModal,
}: {
  url: string;
  isOpen: boolean;
  closeModal: () => void;
}) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    try {
      await WriteOverride(userId, displayUrl, {
        category: override.category,
        flagged_for: selectedDevices.map((d) => d.name),
      });
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const displayUrl = getDisplayUrl(url).replace(/^www\./, ""); // remove www. for better display

  function useSiteMetadata(userId: string, url: string, open: boolean) {
    const [categorization, setCategorization] = useState<Categorization>({
      siteUrl: url,
      category: [],
      is_flagged: false,
    });
    const [override, setOverride] = useState<Override>({
      category: [],
      flagged_for: [],
    });
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
      if (!open) return;

      async function load() {
        let catData = await GetCategorization(url);
        if (!catData) {
          console.warn(`Getting new categorization for ${url}`);
          await classifyURL(url);
          catData = await GetCategorization(url);
        }
        const cat = {
          siteUrl: url,
          category: catData?.data.category ?? ["Unknown"],
          is_flagged: catData?.data.is_flagged ?? false,
        };
        setCategorization(cat);

        const override = await GetOverride(userId, url);
        let normalized: Override;
        if (override) {
          normalized = {
            category: override.data.category,
            flagged_for: override.data.flagged_for,
          };
        } else {
          normalized = {
            category: cat.category[0] === "Unknown" ? [] : cat.category,
            flagged_for: [],
          };
        }
        setOverride(normalized);
        const devicesData = await GetDevices(userId);
        const normalizedDevices: Device[] = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        setDevices(normalizedDevices);
        const categoriesData = await GetCategories();
        const categories: string[] = categoriesData.map((c) => c.data.label);
        setCategories(categories);
        setSelectedDevices(
          normalizedDevices.filter((d) =>
            normalized.flagged_for.includes(d.name),
          ),
        );
      }

      load();
    }, [open, userId, url]);

    return {
      categorization,
      override,
      setOverride,
      devices,
      selectedDevices,
      setSelectedDevices,
      categories,
    };
  }

  const {
    categorization,
    override,
    setOverride,
    devices,
    selectedDevices,
    setSelectedDevices,
    categories,
  } = useSiteMetadata(userId, displayUrl, isOpen);

  return (
    <Modal
      open={isOpen}
      onClose={() => closeModal()}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            borderBottom: "3px solid #000",
            padding: 2,
          }}
        >
          <Typography
            variant="h2"
            id="modal-modal-title"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          >
            {url}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button onClick={() => closeModal()}>X</Button>
            <Link
              href={`https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              visit site
            </Link>
          </Box>
        </Box>
        <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          System Classification:
        </Typography>
        <Autocomplete
          multiple
          disabled
          value={categorization.category}
          options={categories}
          renderInput={(params) => <TextField {...params} />}
        />
        <br />
        <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          My Categories:
        </Typography>
        <Autocomplete
          multiple
          value={override.category}
          onChange={(_: any, newValue: Array<string>) => {
            setOverride({ ...override, category: newValue });
          }}
          options={categories}
          renderInput={(params) => <TextField {...params} />}
        />
        <br />
        <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Flagged For Devices:
        </Typography>
        <DeviceSelect
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={() => closeModal()}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
}
