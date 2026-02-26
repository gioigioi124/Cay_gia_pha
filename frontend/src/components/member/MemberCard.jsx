import { User, Calendar, MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, calculateAge, getGenderLabel } from "@/utils/helpers";

const MemberCard = ({ member, onClick }) => {
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const genderColors = {
    male: "from-blue-500 to-indigo-500",
    female: "from-pink-500 to-rose-500",
    other: "from-purple-500 to-violet-500",
  };

  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);

  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-emerald-500/50 border-border/40"
      onClick={() => onClick?.(member)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {member.avatar && (
              <AvatarImage
                src={member.avatar}
                alt={member.fullName}
                className="object-cover"
              />
            )}
            <AvatarFallback
              className={`bg-linear-to-br ${genderColors[member.gender]} text-white text-sm font-semibold`}
            >
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {member.fullName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{getGenderLabel(member.gender)}</span>
              {age !== null && <span>• {age} tuổi</span>}
            </div>
          </div>
          {!member.isAlive && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-muted-foreground">
              Đã mất
            </span>
          )}
        </div>

        {(member.dateOfBirth || member.birthPlace) && (
          <div className="mt-3 space-y-1">
            {member.dateOfBirth && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(member.dateOfBirth)}</span>
              </div>
            )}
            {member.birthPlace && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{member.birthPlace}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberCard;
