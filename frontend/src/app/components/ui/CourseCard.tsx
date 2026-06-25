import { Link } from 'react-router';
import { BookOpen, Star } from 'lucide-react';
import { Course, assetUrl } from '../../services/api';

const levelLabel: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export function CourseCard({ course }: { course: Course }) {
  const courseType = (course as unknown as Record<string, unknown>).course_type as { name: string; requires_grade: boolean } | undefined;
  const subjectName = course.subject?.name;
  const gradeName = course.grade?.name;

  // Build the category badge text
  let categoryBadge = '';
  if (courseType) {
    if (courseType.requires_grade && gradeName) {
      categoryBadge = `${gradeName}${subjectName ? ' | ' + subjectName : ''}`;
    } else if (!courseType.requires_grade) {
      categoryBadge = `${courseType.name}${subjectName ? ' | ' + subjectName : ''}`;
    }
  } else if (subjectName) {
    categoryBadge = gradeName ? `${gradeName} | ${subjectName}` : subjectName;
  }

  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col"
    >
      <div className="aspect-video bg-secondary relative overflow-hidden flex-shrink-0">
        {course.thumbnail_url ? (
          <img
            src={assetUrl(course.thumbnail_url)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white/90 text-xs font-medium px-2 py-0.5 rounded-full text-primary">
          {levelLabel[course.level] || course.level}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {categoryBadge && (
          <span className="text-xs text-accent font-medium mb-1">{categoryBadge}</span>
        )}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{course.short_description}</p>
        {course.teacher && (
          <p className="text-xs text-muted-foreground mb-2">GV: {course.teacher.full_name}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-accent">
            {course.price === 0 ? 'Miễn phí' : course.price.toLocaleString('vi-VN') + 'đ'}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
