import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthInstance, getDb } from "../utils/firestore";
import {
  doc,
  getDoc,
  type DocumentData,
} from "firebase/firestore";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Paper,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface CommonOverride {
  name: string;
  total: number;
  categories: Record<string, number>;
}

function CommonOverrides() {
  const [allOverrides, setAllOverrides] = useState<CommonOverride[]>([]);
  const [commonOverrides, setCommonOverrides] = useState<CommonOverride[]>([]);
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const db = getDb();
  const auth = getAuthInstance();
  const [SearchParams, SetSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(
    SearchParams.get("q_name") ?? "",
  );
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchResults = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://us-central1-browser-insights-d704b.cloudfunctions.net/getCommonOverrides`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: await auth.currentUser!.getIdToken(),
          },
        },
      );

      if (!response.ok) {
        console.error("Error fetching common overrides:", response.status);
        return;
      }

      const raw: [string, Record<string, number>][] = await response.json();

      const parsed: CommonOverride[] = raw.map(([name, counts]) => {
        const { total, ...categories } = counts;
        return { name, total, categories };
      });

      const filtered = search.trim()
        ? parsed.filter((o) =>
            o.name.toLowerCase().startsWith(search.toLowerCase()),
          )
        : parsed;

      setAllOverrides(parsed);
      setCommonOverrides(filtered);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        const data = userDoc.data() as DocumentData;

        if (!data?.isAdmin) {
          await auth.signOut();
          navigate("/login", { replace: true });
          return;
        }

        setIsAdmin(true);
      } catch {
        await auth.signOut();
        navigate("/login", { replace: true });
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Initial fetch once admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;
    fetchResults(searchQuery);
  }, [isAdmin]);

  // Client-side filtering + URL sync on search query change
  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtered = searchQuery.trim()
        ? allOverrides.filter((o) =>
            o.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
          )
        : allOverrides;
      setCommonOverrides(filtered);
      SetSearchParams(searchQuery ? { q_name: searchQuery } : {}, {
        replace: true,
      });
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, allOverrides]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCardClick = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleNavigateToSite = (e: React.MouseEvent, siteName: string) => {
    e.stopPropagation();
    navigate(`/admin-dashboard?q_name=${encodeURIComponent(siteName)}`);
  };

  if (!authChecked) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Typography color="text.secondary">Verifying access...</Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
        />

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

      {loading && commonOverrides.length === 0 ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : commonOverrides.length > 0 ? (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Common Overrides ({commonOverrides.length})
          </Typography>
          <Stack spacing={2}>
            {commonOverrides.map((override, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <Card
                  key={override.name}
                  onClick={() => handleCardClick(index)}
                  sx={{
                    cursor: "pointer",
                    transition: "box-shadow 0.3s",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    {/* Header row: name + total + expand icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography variant="h6" component="h4">
                          {override.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Count: <strong>{override.total}</strong>
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(index);
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    {/* Collapsible details */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 1.5 }}>
                        {Object.entries(override.categories).map(
                          ([category, count]) => (
                            <Typography
                              key={category}
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              <strong>{category}:</strong> {count}
                            </Typography>
                          ),
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          onClick={(e) =>
                            handleNavigateToSite(e, override.name)
                          }
                          sx={{ mt: 1 }}
                        >
                          View in Dashboard
                        </Button>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
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
            No overrides found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default CommonOverrides;