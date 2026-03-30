import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthInstance, getDb } from "../utils/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import FlagIcon from "@mui/icons-material/Flag";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";

const PAGE_LIMIT = 50;

interface SearchResult {
  name: string;
  categories: string[];
  isFlagged: boolean;
}

function CommonOverrides() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElCategories, setAnchorElCategories] =
    useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [categoryList, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const currentQuery = useRef("");
  const db = getDb();
  const auth = getAuthInstance();

  // Fetch a page of results from Firestore using prefix search
  const fetchResults = useCallback(
    async (search: string, cursor: DocumentSnapshot | null, append = false) => {
      setLoading(true);
      currentQuery.current = search;
      try {
        let q;
        if (!search.trim()) {
          // No search term — just load first page ordered by name
          q = cursor
            ? query(
                collection(db, "Categorization"),
                orderBy("__name__"),
                startAfter(cursor),
                limit(PAGE_LIMIT),
              )
            : query(
                collection(db, "Categorization"),
                orderBy("__name__"),
                limit(PAGE_LIMIT),
              );
        } else {
          // Prefix search on document ID (name field = doc ID in your schema)
          q = cursor
            ? query(
                collection(db, "Categorization"),
                where("__name__", ">=", search),
                where("__name__", "<=", search + "\uf8ff"),
                orderBy("__name__"),
                startAfter(cursor),
                limit(PAGE_LIMIT),
              )
            : query(
                collection(db, "Categorization"),
                where("__name__", ">=", search),
                where("__name__", "<=", search + "\uf8ff"),
                orderBy("__name__"),
                limit(PAGE_LIMIT),
              );
        }

        const snapshot = await getDocs(q);
        const fetched: SearchResult[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            name: doc.id,
            categories: data.category,
            isFlagged: data.is_flagged,
          };
        });

        setSearchResults((prev) => (append ? [...prev, ...fetched] : fetched));
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        setHasMore(fetched.length === PAGE_LIMIT);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            const data = userDoc.data() as DocumentData;
            if (!data?.isAdmin) {
              await auth.signOut();
              navigate("/login", { replace: true });
            }
          } catch {
            navigate("/login", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      });

      // // Initial load
      fetchResults("", null);

      // Load categories
      (async () => {
        const categoriesSnapshot = await getDocs(collection(db, "Categories"));
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          setCategories((prev) => [...prev, data.label as string]);
        });
      })();

      return () => unsubscribe();
    }
  }, [navigate, fetchResults]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastDoc(null);
      fetchResults(searchQuery, null);
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, fetchResults]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleChipClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const handleCategoryClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setAnchorElCategories(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleCategoryMenuClose = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    event;
    index;
    setAnchorElCategories(null);
    setSelectedIndex(null);
  };

  const handleToggleCategory = async (category: string, shouldAdd: boolean) => {
    if (selectedIndex !== null) {
      const result = searchResults[selectedIndex];
      const currentCategories = result.categories;
      const updatedCategories = shouldAdd
        ? [...currentCategories, category]
        : currentCategories.filter((c) => c !== category);
      await updateDoc(doc(db, "Categorization", result.name), {
        category: updatedCategories,
      });
      setSearchResults((prev) =>
        prev.map((r, i) =>
          i === selectedIndex ? { ...r, categories: updatedCategories } : r,
        ),
      );
    }
  };

  const handleToggleFlag = async (shouldFlag: boolean) => {
    if (selectedIndex !== null) {
      await updateDoc(
        doc(db, "Categorization", searchResults[selectedIndex].name),
        { is_flagged: shouldFlag },
      );
      setSearchResults((prev) =>
        prev.map((r, i) =>
          i === selectedIndex ? { ...r, isFlagged: shouldFlag } : r,
        ),
      );
    }
    handleMenuClose();
  };

  const commonOverrides = [{
    "name": "Website1",
    "count": 127,
    "category1": 24,
    "category2": 10,
    "category3": 57
  },
    {
    "name:": "Website2", 
    "count": 10000,
    "category1": 7,
    "category2": 12,
    "category3": 892
  }
];

return (
    <Container maxWidth={false} sx={{ py: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
          Common Overrides
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "grey.50",
            border: 1,
            borderColor: "grey.200",
          }}
        >
        </Paper>

        <TextField
          fullWidth
          placeholder="Search sites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 600 }}
        />

        <Box sx={{ float: "right" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ mb: 4 }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {commonOverrides.length > 0 ? (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Common Overrides ({commonOverrides.length})
          </Typography>
          <Stack spacing={2}>
            {commonOverrides.map((override, index) => (
              <Card
                key={index}
                sx={{
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="h4" sx={{ mb: 1.5 }}>
                    {override.name ?? "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Count:</strong> {override.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Category 1:</strong> {override.category1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Category 2:</strong> {override.category2}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Category 3:</strong> {override.category3}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {hasMore && (
            <Button
              variant="outlined"
              onClick={() => fetchResults(searchQuery, lastDoc, true)}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          )}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "grey.50",
            border: 1,
            borderColor: "grey.200",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No overrides found.
          </Typography>
        </Paper>
      )}

    </Container>
  );
}

export default CommonOverrides;

