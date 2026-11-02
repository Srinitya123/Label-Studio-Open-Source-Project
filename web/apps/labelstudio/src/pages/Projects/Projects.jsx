import React, { useState } from "react";
import { useParams as useRouterParams } from "react-router";
import { Redirect } from "react-router-dom";
import { Button } from "@humansignal/ui";
import { Oneof } from "../../components/Oneof/Oneof";
import { Spinner } from "../../components/Spinner/Spinner";
import { ApiContext } from "../../providers/ApiProvider";
import { useContextProps } from "../../providers/RoutesProvider";
import { cn } from "../../utils/bem";
import { CreateProject } from "../CreateProject/CreateProject";
import { DataManagerPage } from "../DataManager/DataManager";
import { SettingsPage } from "../Settings";
import { EmptyProjectsList, ProjectsList } from "./ProjectsList";
import { useAbortController, useUpdatePageTitle } from "@humansignal/core";
import "./Projects.prefix.css";

const getCurrentPage = () => {
  const pageNumberFromURL = new URLSearchParams(location.search).get("page");
  return pageNumberFromURL ? Number.parseInt(pageNumberFromURL) : 1;
};

export const ProjectsPage = () => {
  const api = React.useContext(ApiContext);
  const abortController = useAbortController();
  const [projectsList, setProjectsList] = React.useState([]);
  const [networkState, setNetworkState] = React.useState(null);
  const [currentPage, setCurrentPage] = useState(getCurrentPage());
  const [totalItems, setTotalItems] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const setContextProps = useContextProps();

  useUpdatePageTitle("Projects");
  const defaultPageSize = Number.parseInt(localStorage.getItem("pages:projects-list") ?? 30);
  const [modal, setModal] = React.useState(false);

  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  // Filter projects by search query
  const filteredProjects = projectsList.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fetchProjects = async (page = currentPage, pageSize = defaultPageSize) => {
    setNetworkState("loading");
    abortController.renew();

    const requestParams = { page, page_size: pageSize };
    requestParams.include = [
      "id",
      "title",
      "created_by",
      "created_at",
      "color",
      "is_published",
      "assignment_settings",
      "state",
    ].join(",");

    const data = await api.callApi("projects", {
      params: requestParams,
      signal: abortController.controller.current.signal,
      errorFilter: (e) => e.error.includes("aborted"),
    });

    setTotalItems(data?.count ?? 1);
    setProjectsList(data.results ?? []);
    setNetworkState("loaded");

    if (data?.results?.length) {
      const additionalData = await api.callApi("projects", {
        params: {
          ids: data?.results?.map(({ id }) => id).join(","),
          include: [
            "id",
            "description",
            "num_tasks_with_annotations",
            "task_number",
            "skipped_annotations_number",
            "total_annotations_number",
            "total_predictions_number",
            "ground_truth_number",
            "finished_task_number",
          ].join(","),
          page_size: pageSize,
        },
        signal: abortController.controller.current.signal,
        errorFilter: (e) => e.error.includes("aborted"),
      });

      if (additionalData?.results?.length) {
        setProjectsList((prev) =>
          additionalData.results.map((project) => {
            const prevProject = prev.find(({ id }) => id === project.id);
            return {
              ...prevProject,
              ...project,
            };
          }),
        );
      }
    }
  };

  const loadNextPage = async (page, pageSize) => {
    setCurrentPage(page);
    await fetchProjects(page, pageSize);
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  React.useEffect(() => {
    setContextProps({ openModal, showButton: projectsList.length > 0 });
  }, [projectsList.length]);

  return (
    <div className={cn("projects-page").toClassName()}>
      <Oneof value={networkState}>
        <div className={cn("projects-page").elem("loading").toClassName()} case="loading">
          <Spinner size={64} />
        </div>
        <div className={cn("projects-page").elem("content").toClassName()} case="loaded">
          {projectsList.length ? (
            <>
              {/* US5: Projects Search */}
              <div style={{ padding: '15px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search projects by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  aria-label="Search projects"
                />
              </div>
              <ProjectsList
                projects={filteredProjects}
                currentPage={currentPage}
                totalItems={totalItems}
                loadNextPage={loadNextPage}
                pageSize={defaultPageSize}
              />
            </>
          ) : (
            <EmptyProjectsList openModal={openModal} />
          )}
          {modal && <CreateProject onClose={closeModal} />}
        </div>
      </Oneof>
    </div>
  );
};

ProjectsPage.title = "Projects";
ProjectsPage.path = "/projects";
ProjectsPage.exact = true;
ProjectsPage.routes = ({ store }) => [
  {
    title: () => store.project?.title,
    path: "/:id(\\d+)",
    exact: true,
    component: () => {
      const params = useRouterParams();
      return <Redirect to={`/projects/${params.id}/data`} />;
    },
    pages: {
      DataManagerPage,
      SettingsPage,
    },
  },
];
ProjectsPage.context = ({ openModal, showButton }) => {
  if (!showButton) return null;
  return (
    <Button onClick={openModal} size="small" aria-label="Create new project">
      Create
    </Button>
  );
};