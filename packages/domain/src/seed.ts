import { calculateGaps } from './assessment.js';
import type { Assessment, Competency, CompetencyCategory, MatrixRequirement, MvpSeed } from './types.js';

const organizationId = 'org-demo';
const roleProfileId = 'profile-backend-go-senior';
const matrixId = 'matrix-backend-go-senior';
const matrixRevisionId = 'matrix-backend-go-senior-r1';
const assessmentId = 'assessment-alexey-backend-go-senior';
const employeeId = 'person-alexey';
const managerId = 'person-marina';

const categories: CompetencyCategory[] = [
  {
    id: 'cat-foundations',
    organizationId,
    categoryType: 'domain',
    name: 'Software engineering foundations',
    description: 'Design, maintainability, engineering standards and technical risk management.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 10,
    status: 'active',
  },
  {
    id: 'cat-go-runtime',
    organizationId,
    categoryType: 'domain',
    name: 'Go language and runtime',
    description: 'Idiomatic Go, runtime behavior, concurrency and performance.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 20,
    status: 'active',
  },
  {
    id: 'cat-backend-api',
    organizationId,
    categoryType: 'domain',
    name: 'Backend API and service design',
    description: 'HTTP, GraphQL, RPC contracts, service boundaries and compatibility.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 30,
    status: 'active',
  },
  {
    id: 'cat-data',
    organizationId,
    categoryType: 'domain',
    name: 'Data storage and persistence',
    description: 'PostgreSQL, transactions, query performance and migrations.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 40,
    status: 'active',
  },
  {
    id: 'cat-distributed',
    organizationId,
    categoryType: 'domain',
    name: 'Distributed systems and integration',
    description: 'Async processing, idempotency, consistency, caching and backpressure.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 50,
    status: 'active',
  },
  {
    id: 'cat-reliability',
    organizationId,
    categoryType: 'domain',
    name: 'Reliability, observability and operations',
    description: 'Logs, metrics, tracing, SLOs, health checks and production debugging.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 60,
    status: 'active',
  },
  {
    id: 'cat-security',
    organizationId,
    categoryType: 'domain',
    name: 'Security and secure engineering',
    description: 'Auth boundaries, validation, secure defaults, secrets and threat awareness.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 70,
    status: 'active',
  },
  {
    id: 'cat-leadership',
    organizationId,
    categoryType: 'domain',
    name: 'Collaboration and technical leadership',
    description: 'Mentoring, code review, technical decisions and delivery-risk ownership.',
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    sortOrder: 80,
    status: 'active',
  },
];

function competency(
  id: string,
  categoryId: string,
  code: string,
  name: string,
  description: string,
  tags: string[],
): Competency {
  return {
    id,
    organizationId,
    categoryId,
    code,
    name,
    description,
    sourceKind: 'system_seed',
    sourceRef: 'COM-A-5',
    validationStatus: 'reviewed',
    tags,
    behavioralIndicators: [
      {
        level: 3,
        description: 'Delivers independently in familiar contexts and explains trade-offs to the team.',
      },
      {
        level: 4,
        description: 'Owns complex work, reviews others, handles ambiguity and prevents recurring defects.',
      },
      {
        level: 5,
        description: 'Sets standards across teams and influences architecture, operations and engineering practice.',
      },
    ],
  };
}

const competencies = [
  competency(
    'comp-software-design',
    'cat-foundations',
    'IT-SEF-001',
    'Software design and architecture trade-offs',
    'Designs maintainable services, explains trade-offs and aligns solutions with operational constraints.',
    ['architecture', 'design', 'senior'],
  ),
  competency(
    'comp-code-quality',
    'cat-foundations',
    'IT-SEF-002',
    'Code quality and maintainability',
    'Keeps code cohesive, testable and readable while reducing accidental complexity.',
    ['quality', 'review'],
  ),
  competency(
    'comp-idiomatic-go',
    'cat-go-runtime',
    'IT-GO-001',
    'Idiomatic Go and standard library',
    'Uses Go language features, standard library and package boundaries idiomatically.',
    ['go', 'language'],
  ),
  competency(
    'comp-go-concurrency',
    'cat-go-runtime',
    'IT-GO-002',
    'Go concurrency and synchronization',
    'Designs goroutine lifecycles, cancellation, channel use and shared-state synchronization safely.',
    ['go', 'concurrency'],
  ),
  competency(
    'comp-go-performance',
    'cat-go-runtime',
    'IT-GO-003',
    'Go profiling and performance',
    'Uses profiling, allocation awareness and runtime diagnostics to solve performance problems.',
    ['go', 'performance'],
  ),
  competency(
    'comp-api-design',
    'cat-backend-api',
    'IT-BE-001',
    'Backend API contract design',
    'Designs stable HTTP, GraphQL or RPC contracts with validation, errors and compatibility in mind.',
    ['api', 'graphql', 'http'],
  ),
  competency(
    'comp-service-boundaries',
    'cat-backend-api',
    'IT-BE-002',
    'Service boundaries and ownership',
    'Defines service responsibilities, avoids leaky coupling and keeps integration points explicit.',
    ['services', 'architecture'],
  ),
  competency(
    'comp-postgres-modeling',
    'cat-data',
    'IT-DATA-001',
    'PostgreSQL schema and transaction design',
    'Models data in normalized schemas, chooses transaction boundaries and maintains migration discipline.',
    ['postgresql', 'db'],
  ),
  competency(
    'comp-query-performance',
    'cat-data',
    'IT-DATA-002',
    'Query performance and indexing',
    'Investigates query plans, indexing, locking and data access patterns.',
    ['postgresql', 'performance'],
  ),
  competency(
    'comp-idempotency',
    'cat-distributed',
    'IT-DIST-001',
    'Idempotency, retries and consistency',
    'Builds integrations that tolerate retries, partial failures and consistency trade-offs.',
    ['distributed', 'integration'],
  ),
  competency(
    'comp-observability',
    'cat-reliability',
    'IT-REL-001',
    'Observability and production debugging',
    'Uses logs, metrics and traces to explain system behavior and shorten incident investigation.',
    ['observability', 'operations'],
  ),
  competency(
    'comp-secure-backend',
    'cat-security',
    'IT-SEC-001',
    'Secure backend engineering',
    'Designs authorization boundaries, validates inputs and protects secrets and sensitive data.',
    ['security', 'backend'],
  ),
  competency(
    'comp-code-review',
    'cat-leadership',
    'IT-LEAD-001',
    'Senior code review',
    'Reviews for correctness, maintainability, risk and learning without turning review into style-only feedback.',
    ['review', 'mentoring'],
  ),
  competency(
    'comp-mentoring',
    'cat-leadership',
    'IT-LEAD-002',
    'Mentoring and technical leadership',
    'Raises team capability through pairing, feedback, standards and clear technical decisions.',
    ['leadership', 'mentoring'],
  ),
] satisfies Competency[];

const requirements: MatrixRequirement[] = [
  ['comp-software-design', 4, 0.1, 'high', true],
  ['comp-code-quality', 4, 0.07, 'high', true],
  ['comp-idiomatic-go', 4, 0.09, 'high', true],
  ['comp-go-concurrency', 4, 0.09, 'high', true],
  ['comp-go-performance', 3, 0.06, 'medium', false],
  ['comp-api-design', 4, 0.09, 'high', true],
  ['comp-service-boundaries', 4, 0.07, 'high', true],
  ['comp-postgres-modeling', 3, 0.07, 'medium', true],
  ['comp-query-performance', 3, 0.05, 'medium', false],
  ['comp-idempotency', 4, 0.07, 'high', true],
  ['comp-observability', 4, 0.07, 'high', true],
  ['comp-secure-backend', 3, 0.07, 'high', true],
  ['comp-code-review', 4, 0.05, 'medium', true],
  ['comp-mentoring', 3, 0.05, 'medium', false],
].map(([competencyId, targetLevel, normalizedWeight, criticality, neededOnEntry], index) => ({
  id: `req-${index + 1}`,
  competencyId: String(competencyId),
  targetLevel: Number(targetLevel),
  required: true,
  normalizedWeight: Number(normalizedWeight),
  weightSource: 'job_analysis',
  criticality: criticality as 'low' | 'medium' | 'high',
  neededOnEntry: Boolean(neededOnEntry),
  taskCompetencyLinkId: `task-link-${index + 1}`,
}));

const assessment: Assessment = {
  id: assessmentId,
  personId: employeeId,
  roleProfileId,
  matrixRevisionId,
  status: 'in_review',
  scores: requirements.flatMap((requirement, index) => {
    const selfLevel = index % 4 === 0 ? requirement.targetLevel : Math.max(requirement.targetLevel - 1, 1);
    const managerLevel = index % 5 === 0 ? Math.max(requirement.targetLevel - 2, 1) : Math.max(requirement.targetLevel - 1, 1);
    const finalLevel = Math.max(Math.max(selfLevel, managerLevel) - (index % 6 === 0 ? 1 : 0), 1);

    return [
      {
        id: `score-self-${index + 1}`,
        competencyId: requirement.competencyId,
        source: 'self' as const,
        level: selfLevel,
        confidence: 0.62,
        verificationStatus: 'unverified' as const,
        comment: 'Self-assessment captured for calibration discussion.',
      },
      {
        id: `score-manager-${index + 1}`,
        competencyId: requirement.competencyId,
        source: 'manager' as const,
        level: managerLevel,
        confidence: 0.74,
        verificationStatus: index % 3 === 0 ? ('evidence_requested' as const) : ('verified' as const),
        comment: 'Manager review based on delivery evidence and code review history.',
      },
      {
        id: `score-final-${index + 1}`,
        competencyId: requirement.competencyId,
        source: 'final' as const,
        level: finalLevel,
        confidence: 0.8,
        verificationStatus: index % 3 === 0 ? ('evidence_requested' as const) : ('verified' as const),
        comment: 'Human-fixed final score for MVP seed.',
      },
    ];
  }),
};

const matrixRevision = {
  id: matrixRevisionId,
  matrixId,
  version: 1,
  activatedAt: '2026-06-20T00:00:00.000Z',
  requirements,
};

const gaps = calculateGaps(matrixRevision, assessment);

export const mvpSeed: MvpSeed = {
  organization: {
    id: organizationId,
    name: 'Naukograd Demo',
    status: 'active',
  },
  orgUnits: [
    {
      id: 'unit-platform',
      organizationId,
      type: 'department',
      name: 'Platform Engineering',
    },
    {
      id: 'unit-backend',
      organizationId,
      parentId: 'unit-platform',
      type: 'team',
      name: 'Backend Platform',
    },
    {
      id: 'unit-sre',
      organizationId,
      parentId: 'unit-platform',
      type: 'team',
      name: 'Site Reliability',
    },
  ],
  people: [
    {
      id: employeeId,
      organizationId,
      fullName: 'Alexey Morozov',
      email: 'alexey.morozov@example.test',
      status: 'active',
    },
    {
      id: managerId,
      organizationId,
      fullName: 'Marina Volkova',
      email: 'marina.volkova@example.test',
      status: 'active',
    },
    {
      id: 'person-hr',
      organizationId,
      fullName: 'Daria People',
      email: 'daria.people@example.test',
      status: 'active',
    },
    {
      id: 'person-expert',
      organizationId,
      fullName: 'Igor Sokolov',
      email: 'igor.sokolov@example.test',
      status: 'active',
    },
    {
      id: 'person-method',
      organizationId,
      fullName: 'Elena Method',
      email: 'elena.method@example.test',
      status: 'active',
    },
  ],
  users: [
    {
      id: 'user-alexey',
      organizationId,
      personId: employeeId,
      email: 'alexey.morozov@example.test',
      role: 'employee',
      status: 'active',
    },
    {
      id: 'user-marina',
      organizationId,
      personId: managerId,
      email: 'marina.volkova@example.test',
      role: 'manager',
      status: 'active',
    },
    {
      id: 'user-daria',
      organizationId,
      personId: 'person-hr',
      email: 'daria.people@example.test',
      role: 'hr',
      status: 'active',
    },
    {
      id: 'user-igor',
      organizationId,
      personId: 'person-expert',
      email: 'igor.sokolov@example.test',
      role: 'expert',
      status: 'active',
    },
    {
      id: 'user-elena',
      organizationId,
      personId: 'person-method',
      email: 'elena.method@example.test',
      role: 'methodology_admin',
      status: 'active',
    },
  ],
  assignments: [
    {
      id: 'assignment-alexey',
      personId: employeeId,
      orgUnitId: 'unit-backend',
      managerPersonId: managerId,
      roleProfileId,
      effectiveFrom: '2026-01-01',
    },
  ],
  categories,
  competencies,
  relations: [
    {
      id: 'rel-concurrency-performance',
      sourceCompetencyId: 'comp-go-concurrency',
      targetCompetencyId: 'comp-go-performance',
      relationType: 'related_to',
      strength: 0.7,
    },
    {
      id: 'rel-design-boundaries',
      sourceCompetencyId: 'comp-software-design',
      targetCompetencyId: 'comp-service-boundaries',
      relationType: 'prerequisite_for',
      strength: 0.8,
    },
  ],
  levels: [
    {
      value: 1,
      title: 'Aware',
      description: 'Understands basics and works with close support.',
    },
    {
      value: 2,
      title: 'Practicing',
      description: 'Handles routine work independently in familiar contexts.',
    },
    {
      value: 3,
      title: 'Independent',
      description: 'Delivers standard work independently and explains trade-offs.',
    },
    {
      value: 4,
      title: 'Senior',
      description: 'Owns complex work, guides others and prevents recurring risks.',
    },
    {
      value: 5,
      title: 'Principal',
      description: 'Sets direction across teams and influences organizational practice.',
    },
  ],
  roleFamilies: [
    {
      id: 'family-engineering',
      organizationId,
      name: 'Engineering',
    },
  ],
  roles: [
    {
      id: 'role-backend-engineer',
      roleFamilyId: 'family-engineering',
      name: 'Backend Engineer',
    },
  ],
  grades: [
    {
      id: 'grade-senior',
      organizationId,
      name: 'Senior',
      rank: 4,
    },
  ],
  roleProfiles: [
    {
      id: roleProfileId,
      roleId: 'role-backend-engineer',
      gradeId: 'grade-senior',
      name: 'Backend Go Engineer / Senior',
      description: 'Senior backend engineer profile focused on Go services and platform-grade delivery.',
    },
  ],
  roleTasks: [
    {
      id: 'task-service-design',
      roleProfileId,
      name: 'Design and evolve Go backend services',
      expectedOutcome: 'Services have clear boundaries, reliable APIs and maintainable internals.',
      criticality: 'high',
    },
    {
      id: 'task-production-readiness',
      roleProfileId,
      name: 'Keep services production-ready',
      expectedOutcome: 'Services are observable, secure and resilient to expected failure modes.',
      criticality: 'high',
    },
  ],
  taskCompetencyLinks: requirements.map((requirement, index) => ({
    id: `task-link-${index + 1}`,
    roleTaskId: index < 8 ? 'task-service-design' : 'task-production-readiness',
    competencyId: requirement.competencyId,
    criticality: requirement.criticality,
    neededOnEntry: requirement.neededOnEntry,
  })),
  matrices: [
    {
      id: matrixId,
      roleProfileId,
      name: 'Backend Go Engineer / Senior matrix',
      status: 'active',
      activeRevisionId: matrixRevisionId,
    },
  ],
  matrixRevisions: [matrixRevision],
  assessments: [assessment],
  developmentPlans: [
    {
      id: 'devplan-alexey-v1',
      personId: employeeId,
      assessmentId,
      items: gaps
        .filter((gap) => gap.gap > 0)
        .slice(0, 5)
        .map((gap, index) => ({
          id: `devitem-${index + 1}`,
          competencyId: gap.competencyId,
          gap: gap.gap,
          title: `Close level ${gap.gap} gap for ${competencies.find((item) => item.id === gap.competencyId)?.name}`,
          ownerPersonId: employeeId,
          status: 'planned',
          dueDate: '2026-09-30',
        })),
    },
  ],
  dashboard: {
    activeCycleName: 'v0.1 Backend Go Senior pilot',
    ontologyDomains: categories.length,
    competencies: competencies.length,
    matrixRequirements: requirements.length,
    assessmentCoveragePercent: 100,
    criticalGaps: gaps.filter((gap) => gap.gap > 0 && gap.criticality === 'high').length,
  },
};

export const mvpGaps = gaps;

