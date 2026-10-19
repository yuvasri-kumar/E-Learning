import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import CourseList from "../components/CourseList";
import Enrollment from "../components/Enrollment";
import CourseDetail from "../components/CourseDetail";
import Quiz from "../components/Quiz";
import Assignment from "../components/Assignment";
import learningReducer, { updateProgress } from "../store/learningSlice";

const mockDispatch = jest.fn();
let mockParams = { id: "1" };
let mockFetchData = null;
let mockFetchLoading = false;
let mockFetchError = "";
let mockSelectorState = {
  learning: { enrolledCourseIds: [], completedLessons: {}, quizResults: {}, assignments: [] },
  courses: { items: [], status: "succeeded", error: "" }
};

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector(mockSelectorState)
}));
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useParams: () => mockParams, useNavigate: () => jest.fn() };
});
jest.mock("../api/useFetch", () => () => ({
  data: mockFetchData,
  loading: mockFetchLoading,
  error: mockFetchError,
  retry: jest.fn()
}));
jest.mock("../components/LearningGate", () => ({ children }) => children);

const sampleCourse = {
  id: "1", title: "React for Beginners", category: "Web Development", level: "Beginner",
  instructor: "Anita Sharma", duration: "6 hours", lessons: 2, price: 0, rating: 4.7,
  description: "Learn React components and hooks.", image: "https://example.com/react.png",
  syllabus: ["JSX", "Hooks"],
  lessonList: [{ id: "l1", title: "JSX", content: "JSX lesson content" }, { id: "l2", title: "Hooks", content: "Hooks lesson content" }],
  materials: [{ id: "m1", title: "React Documentation", type: "Reference", url: "https://react.dev" }]
};
const twelveCourses = Array.from({ length: 12 }, (_, index) => ({
  ...sampleCourse, id: String(index + 1), title: `Course ${index + 1}`, price: 0
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { id: "1" };
  mockFetchData = null;
  mockFetchLoading = false;
  mockFetchError = "";
  mockSelectorState = {
    learning: { enrolledCourseIds: [], completedLessons: {}, quizResults: {}, assignments: [] },
    courses: { items: twelveCourses, status: "succeeded", error: "" }
  };
  mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({ courseId: "1", attempt: { score: 4, total: 4, passed: true, passingScore: 3 }, result: { courseId: "1", score: 1, total: 1, passed: true, passingScore: 1 } }) });
});

test("course card displays course information and details link", () => {
  render(<MemoryRouter><CourseCard course={sampleCourse} /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "React for Beginners" })).toBeInTheDocument();
  expect(screen.getByText("Web Development")).toBeInTheDocument();
  expect(screen.getByText("Free")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View Details" })).toHaveAttribute("href", "/courses/1");
});

test("search input sends the typed course title after debounce", () => {
  jest.useFakeTimers();
  const onSearch = jest.fn();
  render(<SearchBar onSearch={onSearch} placeholder="Search by title..." />);
  fireEvent.change(screen.getByRole("textbox", { name: "Search courses" }), { target: { value: "React" } });
  act(() => { jest.advanceTimersByTime(350); });
  expect(onSearch).toHaveBeenLastCalledWith("React");
  jest.useRealTimers();
});

test("filter panel changes category and can reset filters", () => {
  const onCategoryChange = jest.fn();
  const onLevelChange = jest.fn();
  const onReset = jest.fn();
  render(<FilterPanel categories={["Web Development", "Programming"]} levels={["Beginner", "Advanced"]} selectedCategory="All" selectedLevel="All" onCategoryChange={onCategoryChange} onLevelChange={onLevelChange} onReset={onReset} />);
  fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Programming" } });
  expect(onCategoryChange).toHaveBeenCalledWith("Programming");
  fireEvent.click(screen.getByRole("button", { name: "Reset Filters" }));
  expect(onReset).toHaveBeenCalled();
});

test("course list shows six courses per page and next page shows the remaining six", () => {
  mockFetchData = twelveCourses;
  render(<MemoryRouter><CourseList courses={twelveCourses} /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Course 1" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Course 6" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Course 7" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("heading", { name: "Course 7" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Course 12" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Course 6" })).not.toBeInTheDocument();
});

test("enrollment validates required fields and submits valid details", async () => {
  render(<MemoryRouter><Enrollment courses={[sampleCourse]} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Confirm Enrollment" }));
  expect(screen.getByText("Name is required")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Yuvasri" } });
  fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "yuvasri@example.com" } });
  fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "9876543210" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm Enrollment" }));
  await waitFor(() => expect(screen.getByText(/successfully enrolled in/)).toBeInTheDocument());
  expect(mockDispatch).toHaveBeenCalled();
});

test("course detail displays syllabus, learning materials and lesson content", () => {
  mockFetchData = sampleCourse;
  mockSelectorState.learning.enrolledCourseIds = ["1"];
  render(<MemoryRouter><CourseDetail /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "React for Beginners" })).toBeInTheDocument();
  expect(screen.getByText("React Documentation")).toHaveAttribute("href", "https://react.dev");
  fireEvent.click(screen.getAllByRole("button", { name: "Read Lesson" })[0]);
  expect(screen.getByText("JSX lesson content")).toBeInTheDocument();
});

test("quiz allows a learner to answer and submit questions", async () => {
  mockParams = { id: "1" };
  mockSelectorState.learning.enrolledCourseIds = ["1"];
  mockSelectorState.learning.completedLessons = { "1": ["l1", "l2"] };
  mockFetchData = { questions: [{ id: "q1", question: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension"], answer: 0 }] };
  render(<MemoryRouter><Quiz courses={[sampleCourse]} /></MemoryRouter>);
  fireEvent.click(screen.getByLabelText("JavaScript XML"));
  fireEvent.click(screen.getByRole("button", { name: "Submit Quiz" }));
  await waitFor(() => expect(screen.getByText(/Your Score:/)).toBeInTheDocument());
  expect(mockDispatch).toHaveBeenCalled();
});

test("quiz picker prompts the learner to enroll when no course is enrolled", () => {
  mockParams = {};
  render(<MemoryRouter><Quiz courses={twelveCourses} /></MemoryRouter>);
  expect(screen.getByText("Enroll in a course to take its quiz.")).toBeInTheDocument();
});

test("assignment form validates and submits a completed assignment", async () => {
  render(<Assignment />);
  fireEvent.click(screen.getByRole("button", { name: "Submit Assignment" }));
  expect(screen.getByText("Assignment title is required")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Assignment Title"), { target: { value: "React project" } });
  fireEvent.change(screen.getByLabelText("Notes / Description"), { target: { value: "Created reusable course components." } });
  fireEvent.click(screen.getByRole("button", { name: "Submit Assignment" }));
  await waitFor(() => expect(screen.getByText("Assignment submitted successfully!")).toBeInTheDocument());
  expect(mockDispatch).toHaveBeenCalled();
});

test("learning progress reducer records a completed lesson", () => {
  const state = {
    enrolledCourseIds: ["1"], completedLessons: { "1": [] }, quizResults: {}, assignments: [],
    status: "idle", error: "", loadRequestId: ""
  };
  const next = learningReducer(state, updateProgress({ courseId: "1", lessonId: "l1" }));
  expect(next.completedLessons["1"]).toEqual(["l1"]);
});
