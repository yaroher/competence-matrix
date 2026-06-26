import { schema } from '@comatrix/api-contracts';
import {
  buildSkillCatalogTree,
  type CompetencyRole,
  type CompetencyRoleSkill,
  type RoleSkillGradeTarget,
  type Skill,
  type SkillCatalogNode,
  type SkillScaleMark,
} from '@comatrix/domain';
import { createSchema } from 'graphql-yoga';
import type {
  AddSkillToCompetencyRoleInput,
  CatalogRepository,
  CreateCompetencyRoleInput,
  CreateGradeInput,
  CreateSkillCatalogFolderInput,
  CreateSkillInput,
  CreateSkillScaleMarkInput,
  DeleteSkillCatalogNodeInput,
  DeleteSkillScaleMarkInput,
  MoveSkillCatalogNodeInput,
  PlaceSkillInCatalogInput,
  RemoveSkillFromCompetencyRoleInput,
  SetRoleSkillGradeTargetInput,
  UpdateCompetencyRoleInput,
  UpdateCompetencyRoleSkillInput,
  UpdateGradeInput,
  UpdateSkillCatalogFolderInput,
  UpdateSkillInput,
  UpdateSkillScaleMarkInput,
} from './catalog-repository.js';

export interface AppContext {}

export function createAppContext() {
  return (): AppContext => ({});
}

export function createExecutableSchema(repository: CatalogRepository) {
  return createSchema({
    typeDefs: schema,
    resolvers: {
      Query: {
        health: () => ({
          ok: true,
          service: 'comatrix-api',
        }),
        grades: () => repository.listGrades(),
        skills: () => repository.listSkills(),
        skillCatalogNodes: () => repository.listCatalogNodes(),
        skillCatalogTree: async () => buildSkillCatalogTree(await repository.listCatalogNodes()),
        competencyRoles: () => repository.listCompetencyRoles(),
        competencyRole: (_parent: unknown, args: { id: string }) => repository.findCompetencyRole(args.id),
      },
      Mutation: {
        createGrade: (_parent: unknown, args: { input: CreateGradeInput }) => repository.createGrade(args.input),
        updateGrade: (_parent: unknown, args: { input: UpdateGradeInput }) => repository.updateGrade(args.input),
        createSkill: (_parent: unknown, args: { input: CreateSkillInput }) => repository.createSkill(args.input),
        updateSkill: (_parent: unknown, args: { input: UpdateSkillInput }) => repository.updateSkill(args.input),
        createSkillScaleMark: (_parent: unknown, args: { input: CreateSkillScaleMarkInput }) =>
          repository.createSkillScaleMark(args.input),
        updateSkillScaleMark: (_parent: unknown, args: { input: UpdateSkillScaleMarkInput }) =>
          repository.updateSkillScaleMark(args.input),
        deleteSkillScaleMark: (_parent: unknown, args: { input: DeleteSkillScaleMarkInput }) =>
          repository.deleteSkillScaleMark(args.input),
        createSkillCatalogFolder: (_parent: unknown, args: { input: CreateSkillCatalogFolderInput }) =>
          repository.createSkillCatalogFolder(args.input),
        updateSkillCatalogFolder: (_parent: unknown, args: { input: UpdateSkillCatalogFolderInput }) =>
          repository.updateSkillCatalogFolder(args.input),
        placeSkillInCatalog: (_parent: unknown, args: { input: PlaceSkillInCatalogInput }) =>
          repository.placeSkillInCatalog(args.input),
        moveSkillCatalogNode: (_parent: unknown, args: { input: MoveSkillCatalogNodeInput }) =>
          repository.moveSkillCatalogNode(args.input),
        deleteSkillCatalogNode: (_parent: unknown, args: { input: DeleteSkillCatalogNodeInput }) =>
          repository.deleteSkillCatalogNode(args.input),
        createCompetencyRole: (_parent: unknown, args: { input: CreateCompetencyRoleInput }) =>
          repository.createCompetencyRole(args.input),
        updateCompetencyRole: (_parent: unknown, args: { input: UpdateCompetencyRoleInput }) =>
          repository.updateCompetencyRole(args.input),
        addSkillToCompetencyRole: (_parent: unknown, args: { input: AddSkillToCompetencyRoleInput }) =>
          repository.createCompetencyRoleSkill(args.input),
        updateCompetencyRoleSkill: (_parent: unknown, args: { input: UpdateCompetencyRoleSkillInput }) =>
          repository.updateCompetencyRoleSkill(args.input),
        removeSkillFromCompetencyRole: (_parent: unknown, args: { input: RemoveSkillFromCompetencyRoleInput }) =>
          repository.removeCompetencyRoleSkill(args.input),
        setRoleSkillGradeTarget: (_parent: unknown, args: { input: SetRoleSkillGradeTargetInput }) =>
          repository.setRoleSkillGradeTarget(args.input),
      },
      Skill: {
        marks: (skill: Skill) => repository.listSkillScaleMarks(skill.id),
      },
      SkillScaleMark: {
        skill: (mark: SkillScaleMark) => repository.getSkill(mark.skillId),
      },
      SkillCatalogNode: {
        parent: (node: SkillCatalogNode) => repository.getCatalogNodeParent(node),
        skill: (node: SkillCatalogNode) => repository.getCatalogNodeSkill(node),
        children: (node: SkillCatalogNode) => repository.listCatalogNodeChildren(node.id),
      },
      CompetencyRole: {
        skills: (role: CompetencyRole) => repository.listCompetencyRoleSkills(role.id),
      },
      CompetencyRoleSkill: {
        role: (roleSkill: CompetencyRoleSkill) => repository.getCompetencyRole(roleSkill.roleId),
        skill: (roleSkill: CompetencyRoleSkill) => repository.getSkill(roleSkill.skillId),
        gradeTargets: (roleSkill: CompetencyRoleSkill) => repository.listRoleSkillGradeTargets(roleSkill.id),
      },
      RoleSkillGradeTarget: {
        roleSkill: (target: RoleSkillGradeTarget) => repository.getCompetencyRoleSkill(target.roleSkillId),
        grade: (target: RoleSkillGradeTarget) => repository.getGrade(target.gradeId),
      },
    },
  });
}
