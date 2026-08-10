import { computeProgress, type Progress } from "@/lib/study";
import type { Chapter, Subject, Syllabus, Topic } from "@/lib/data";

export type ChapterNode = { chapter: Chapter; topics: Topic[]; progress: Progress };
export type SubjectNode = {
  subject: Subject;
  chapters: ChapterNode[];
  freeTopics: Topic[];
  progress: Progress;
};

export function buildTree(s: Syllabus): SubjectNode[] {
  return s.subjects.map((subject) => {
    const chapters = s.chapters
      .filter((c) => c.subject_id === subject.id)
      .map((chapter) => {
        const topics = s.topics.filter((t) => t.chapter_id === chapter.id);
        return { chapter, topics, progress: computeProgress(topics.map((t) => t.status)) };
      });
    const freeTopics = s.topics.filter((t) => t.subject_id === subject.id && !t.chapter_id);
    const all = s.topics.filter((t) => t.subject_id === subject.id);
    return { subject, chapters, freeTopics, progress: computeProgress(all.map((t) => t.status)) };
  });
}

export function overallProgress(s: Syllabus): Progress {
  return computeProgress(s.topics.map((t) => t.status));
}