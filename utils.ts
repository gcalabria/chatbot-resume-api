import {
  type LinkedInProfile,
  type Language,
  type Position,
  type Education,
  type Date,
  Month,
  type Skill,
} from "./interfaces";
import { Document } from "langchain/document";

function dateToText(date: Date) {
  return `${Month[date.month]} ${date.year}`;
}

function languagesToText(languages: Language[]) {
  const num_languages = languages.length;
  if (num_languages === 0) {
    return;
  }
  let text = "I can speak";
  languages.forEach((lang, i) => {
    if (i === num_languages - 1) {
      text = text + ` and ${lang.name}. `;
    } else {
      text = text + ` ${lang.name},`;
    }
  });
  return text;
}

function positionsToText(positions: Position[]) {
  const num_positions = positions.length;
  if (num_positions === 0) {
    return;
  }
  let text = "I have worked";
  positions.forEach((pos, i) => {
    if (i === num_positions - 1) {
      text =
        text +
        `I have also worked at ${pos.companyName} as a ${
          pos.title
        } from ${dateToText(pos.start)} until ${dateToText(
          pos.end
        )}. My main activities there included: ${pos.description}. `;
    } else {
      text =
        text +
        ` at ${pos.companyName} as a ${pos.title} from ${dateToText(
          pos.start
        )} until ${dateToText(pos.end)}. My main activities there included: ${
          pos.description
        }.`;
    }
  });
  return text;
}

function educationsToText(educations: Education[]) {
  const num_educations = educations.length;
  if (num_educations === 0) {
    return;
  }
  let text = "My academic background includes";
  educations.forEach((edu, i) => {
    if (i === num_educations - 1) {
      text =
        text +
        ` and a ${edu.degree} in ${edu.fieldOfStudy} at ${
          edu.schoolName
        } from ${dateToText(edu.start)} until ${dateToText(edu.end)}. `;
    } else {
      text =
        text +
        ` a ${edu.degree} in ${edu.fieldOfStudy} at ${
          edu.schoolName
        } from ${dateToText(edu.start)} until ${dateToText(edu.end)},`;
    }
  });
  return text;
}

function skillsToText(skills: Skill[]) {
  const num_skills = skills.length;
  if (num_skills === 0) {
    return;
  }
  let text = `Throughout my career I could accumulate skills like: `;
  skills.forEach((skill, i) => {
    if (i === num_skills - 1) {
      text = text + `and ${skill.name}. `;
    } else {
      text = text + `${skill.name}, `;
    }
  });
  return text;
}

function linkedInProfileToText(profile: LinkedInProfile) {
  let text =
    `My name is ${profile.firstName} ${profile.lastName}. ` +
    `I am currently living in ${profile.geo.full}. `;

  text = text + languagesToText(profile.languages);

  text = text + educationsToText(profile.educations);

  text = text + positionsToText(profile.position);

  text = text + skillsToText(profile.skills);

  text = text + `In summary, I am a ${profile.headline}`;

  return text;
}

function combineDocuments(docs: Document[]) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

export { linkedInProfileToText, combineDocuments };
