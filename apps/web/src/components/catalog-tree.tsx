import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Check,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  CircleDot,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SkillVm } from '@/api';
import {
  createSkill,
  createSkillCatalogFolder,
  createSkillScaleMark,
  deleteSkillCatalogNode,
  deleteSkillScaleMark,
  placeSkillInCatalog,
  updateSkill,
  updateSkillCatalogFolder,
  updateSkillScaleMark,
} from '@/api';
import {
  assertScaleBounds,
  assertScaleValue,
  collectFolderIds,
  CREATED_BY_USER_ID,
  descendantSkillIds,
  isScaleValue,
  requireText,
  parseRequiredInt,
  SKILL_DND_MIME,
  type CatalogTreeNode,
  type RunAction,
} from '@/lib/catalog';
import { useDebouncedSave } from '@/lib/use-debounced-save';

const ROW_HEIGHT = 30;

type FlatNode = { node: CatalogTreeNode; depth: number };

/** Flatten the tree into the list of currently-visible rows (respecting expand + search). */
function flattenTree(
  roots: readonly CatalogTreeNode[],
  expanded: Set<string>,
  visible: Set<string> | null,
): FlatNode[] {
  const out: FlatNode[] = [];
  const walk = (node: CatalogTreeNode, depth: number) => {
    if (visible && !visible.has(node.id)) {
      return;
    }
    out.push({ node, depth });
    if (node.kind === 'FOLDER') {
      const open = visible !== null || expanded.has(node.id);
      if (open) {
        node.children.forEach((child) => walk(child, depth + 1));
      }
    }
  };
  roots.forEach((node) => walk(node, 0));
  return out;
}

type CatalogTreeProps = {
  roots: readonly CatalogTreeNode[];
  skillsById: Map<string, SkillVm>;
  matrixSkillIds: Set<string>;
  hasOpenMatrix: boolean;
  isSaving: boolean;
  runAction: RunAction;
  onQuickAdd: (skillId: string) => void;
};

export function CatalogTree({
  roots,
  skillsById,
  matrixSkillIds,
  hasOpenMatrix,
  isSaving,
  runAction,
  onQuickAdd,
}: CatalogTreeProps) {
  const folderIds = useMemo(() => collectFolderIds(roots), [roots]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(folderIds));
  const [query, setQuery] = useState('');

  // Keep newly created folders expanded by default.
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      folderIds.forEach((id) => {
        if (!prev.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [folderIds]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const nameOf = useCallback(
    (node: CatalogTreeNode) =>
      node.kind === 'FOLDER' ? node.folderName ?? '' : skillsById.get(node.skillId ?? '')?.name ?? node.skill?.name ?? '',
    [skillsById],
  );

  // Search: visible = matches + their ancestors + (whole subtree of a matched folder). null = no filter.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return null;
    }
    const result = new Set<string>();
    const addSubtree = (node: CatalogTreeNode) => {
      result.add(node.id);
      node.children.forEach(addSubtree);
    };
    const walk = (node: CatalogTreeNode, ancestors: CatalogTreeNode[]): boolean => {
      const selfMatch = nameOf(node).toLowerCase().includes(q);
      let childMatch = false;
      for (const child of node.children) {
        if (walk(child, [...ancestors, node])) {
          childMatch = true;
        }
      }
      if (selfMatch || childMatch) {
        ancestors.forEach((a) => result.add(a.id));
        result.add(node.id);
        if (selfMatch && node.kind === 'FOLDER') {
          addSubtree(node);
        }
      }
      return selfMatch || childMatch;
    };
    roots.forEach((node) => walk(node, []));
    return result;
  }, [query, roots, nameOf]);

  const flat = useMemo(() => flattenTree(roots, expanded, visible), [roots, expanded, visible]);
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: flat.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-1 px-3 pt-2.5 pb-1.5">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Каталог навыков</span>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => setExpanded(new Set())}>
                <ChevronsDownUp />
                <span className="sr-only">Свернуть всё</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Свернуть всё</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => setExpanded(new Set(folderIds))}>
                <ChevronsUpDown />
                <span className="sr-only">Развернуть всё</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Развернуть всё</TooltipContent>
          </Tooltip>
          <AddNodePopover parentId={undefined} parentLabel="корень" isSaving={isSaving} runAction={runAction} />
        </div>
      </div>
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по каталогу…"
            className="h-8 pl-8 pr-7 text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Очистить"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
      <Separator />
      <div ref={parentRef} className="min-h-0 flex-1 overflow-auto p-2">
        {roots.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Каталог пуст. Используйте + сверху, чтобы добавить папку или навык.
          </p>
        ) : visible && flat.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Ничего не найдено.</p>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const { node, depth } = flat[item.index];
              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: ROW_HEIGHT,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <TreeRow
                    node={node}
                    depth={depth}
                    open={visible !== null || expanded.has(node.id)}
                    toggle={toggle}
                    skillsById={skillsById}
                    matrixSkillIds={matrixSkillIds}
                    hasOpenMatrix={hasOpenMatrix}
                    isSaving={isSaving}
                    runAction={runAction}
                    onQuickAdd={onQuickAdd}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

type TreeRowProps = {
  node: CatalogTreeNode;
  depth: number;
  open: boolean;
  toggle: (id: string) => void;
  skillsById: Map<string, SkillVm>;
  matrixSkillIds: Set<string>;
  hasOpenMatrix: boolean;
  isSaving: boolean;
  runAction: RunAction;
  onQuickAdd: (skillId: string) => void;
};

/** One flattened, virtualized tree row (folder or skill). No recursion. */
function TreeRow({ node, depth, open, toggle, skillsById, matrixSkillIds, hasOpenMatrix, isSaving, runAction, onQuickAdd }: TreeRowProps) {
  const [dragging, setDragging] = useState(false);
  const indent = { paddingLeft: `${depth * 14 + 6}px` };

  if (node.kind === 'FOLDER') {
    const skillIds = descendantSkillIds(node);
    return (
      <div
        className="tree-row group h-full"
        style={indent}
        data-dragging={dragging}
        draggable={hasOpenMatrix && skillIds.length > 0}
        onDoubleClick={() => toggle(node.id)}
        onDragStart={(event) => {
          event.dataTransfer.setData(SKILL_DND_MIME, JSON.stringify({ type: 'folder', skillIds }));
          event.dataTransfer.effectAllowed = 'copy';
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
      >
        <button
          type="button"
          onClick={() => toggle(node.id)}
          className="grid size-4 shrink-0 place-items-center text-muted-foreground transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
          aria-label={open ? 'Свернуть' : 'Развернуть'}
        >
          <ChevronRight className="size-3.5" />
        </button>
        {open ? <FolderOpen className="size-4 shrink-0 text-secondary" /> : <Folder className="size-4 shrink-0 text-secondary" />}
        <InlineName
          value={node.folderName ?? 'Папка без названия'}
          withPencil
          onCommit={(name) => runAction('Переименовать папку', () => updateSkillCatalogFolder({ id: node.id, name: requireText(name, 'Название папки') }))}
        />
        <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <AddNodePopover parentId={node.id} parentLabel={node.folderName ?? 'папку'} isSaving={isSaving} runAction={runAction} />
          <DeleteNodePopover nodeId={node.id} kind="FOLDER" name={node.folderName ?? 'папка'} isSaving={isSaving} runAction={runAction} />
        </span>
      </div>
    );
  }

  const skill = node.skillId ? skillsById.get(node.skillId) : undefined;
  const inMatrix = node.skillId ? matrixSkillIds.has(node.skillId) : false;

  return (
    <div
      className="tree-row tree-skill group h-full"
      style={indent}
      data-dragging={dragging}
      data-inmatrix={inMatrix}
      draggable
      title={hasOpenMatrix ? 'Перетащите в матрицу · двойной клик — добавить' : 'Откройте матрицу, чтобы назначить навык'}
      onDragStart={(event) => {
        if (!node.skillId) {
          return;
        }
        event.dataTransfer.setData(SKILL_DND_MIME, JSON.stringify({ type: 'skill', skillId: node.skillId }));
        event.dataTransfer.effectAllowed = 'copy';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onDoubleClick={() => {
        if (node.skillId && hasOpenMatrix && !inMatrix) {
          onQuickAdd(node.skillId);
        }
      }}
    >
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/60" />
      <CircleDot className="size-4 shrink-0 text-primary" />
      <InlineName value={skill?.name ?? node.skill?.name ?? 'Навык без названия'} onCommit={() => undefined} />
      {inMatrix ? <Check className="size-3.5 shrink-0 text-primary" /> : null}
      <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {skill ? <SkillInspectorPopover skill={skill} isSaving={isSaving} runAction={runAction} /> : null}
        <DeleteNodePopover nodeId={node.id} kind="SKILL" name={skill?.name ?? node.skill?.name ?? 'навык'} isSaving={isSaving} runAction={runAction} />
      </span>
    </div>
  );
}

/** Inline rename via the pencil button (hover). Enter commits, Escape cancels. */
function InlineName({
  value,
  onCommit,
  withPencil,
}: {
  value: string;
  onCommit: (next: string) => Promise<void> | void;
  withPencil?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft !== value) {
      void onCommit(draft.trim());
    } else {
      setDraft(value);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            commit();
          } else if (event.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="h-6 flex-1 rounded-md px-1.5 py-0 text-[13px] font-semibold"
      />
    );
  }

  return (
    <span className="tree-label inline-flex items-center gap-1">
      <span className="truncate">{value}</span>
      {withPencil ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setEditing(true);
          }}
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          aria-label="Переименовать"
        >
          <Pencil className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

function AddNodePopover({
  parentId,
  parentLabel,
  isSaving,
  runAction,
}: {
  parentId: string | undefined;
  parentLabel: string;
  isSaving: boolean;
  runAction: RunAction;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={(event) => event.stopPropagation()}>
              <Plus />
              <span className="sr-only">Добавить в {parentLabel}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Добавить в {parentLabel}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72 p-0" onClick={(event) => event.stopPropagation()}>
        <Tabs defaultValue="skill">
          <div className="border-b border-border p-2">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
              <TabsTrigger value="skill" className="gap-1.5">
                <FilePlus2 className="size-3.5" /> Навык
              </TabsTrigger>
              <TabsTrigger value="folder" className="gap-1.5">
                <FolderPlus className="size-3.5" /> Папка
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-3">
            <TabsContent value="skill" className="mt-0">
              <NewSkillForm parentId={parentId} isSaving={isSaving} runAction={runAction} onDone={close} />
            </TabsContent>
            <TabsContent value="folder" className="mt-0">
              <NewFolderForm parentId={parentId} isSaving={isSaving} runAction={runAction} onDone={close} />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function DeleteNodePopover({
  nodeId,
  kind,
  name,
  isSaving,
  runAction,
}: {
  nodeId: string;
  kind: 'FOLDER' | 'SKILL';
  name: string;
  isSaving: boolean;
  runAction: RunAction;
}) {
  const [open, setOpen] = useState(false);
  const isFolder = kind === 'FOLDER';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={(event) => event.stopPropagation()}
            >
              <Trash2 />
              <span className="sr-only">Удалить {name}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{isFolder ? 'Удалить папку' : 'Удалить навык'}</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-64" onClick={(event) => event.stopPropagation()}>
        <p className="text-sm font-medium">{isFolder ? 'Удалить папку и содержимое?' : 'Удалить навык?'}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isFolder
            ? `«${name}» со всеми вложенными папками и навыками будет удалена. Эти навыки исчезнут из всех матриц.`
            : `«${name}» будет удалён из каталога и из всех матриц. Действие необратимо.`}
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isSaving}
            onClick={() => {
              setOpen(false);
              void runAction(isFolder ? 'Удалить папку' : 'Удалить навык', () => deleteSkillCatalogNode({ id: nodeId }));
            }}
          >
            <Trash2 /> Удалить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NewFolderForm({ parentId, isSaving, runAction, onDone }: { parentId?: string; isSaving: boolean; runAction: RunAction; onDone: () => void }) {
  const [name, setName] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onDone();
    void runAction('Создать папку', async () => {
      await createSkillCatalogFolder({ name: requireText(name, 'Название папки'), parentId, createdByUserId: CREATED_BY_USER_ID });
      setName('');
    });
  }
  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid gap-2">
        <Label htmlFor="add-folder-name">Название папки</Label>
        <Input id="add-folder-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="напр. Backend" />
      </div>
      <Button type="submit" size="sm" disabled={isSaving}>
        <FolderPlus /> Создать папку
      </Button>
    </form>
  );
}

function NewSkillForm({ parentId, isSaving, runAction, onDone }: { parentId?: string; isSaving: boolean; runAction: RunAction; onDone: () => void }) {
  const [name, setName] = useState('');
  const [scaleMin, setScaleMin] = useState('0');
  const [scaleMax, setScaleMax] = useState('5');
  const [scaleStep, setScaleStep] = useState('1');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onDone();
    void runAction('Создать навык', async () => {
      const min = parseRequiredInt(scaleMin, 'Мин');
      const max = parseRequiredInt(scaleMax, 'Макс');
      const step = parseRequiredInt(scaleStep, 'Шаг');
      assertScaleBounds(min, max, step);
      const skill = await createSkill({
        name: requireText(name, 'Название навыка'),
        description: '',
        scaleMin: min,
        scaleMax: max,
        scaleStep: step,
        createdByUserId: CREATED_BY_USER_ID,
      });
      await placeSkillInCatalog({ skillId: skill.id, parentId, createdByUserId: CREATED_BY_USER_ID });
      setName('');
    });
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid gap-2">
        <Label htmlFor="add-skill-name">Название навыка</Label>
        <Input id="add-skill-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="напр. Observability" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor="add-skill-min" className="text-xs">Мин</Label>
          <Input id="add-skill-min" value={scaleMin} onChange={(event) => setScaleMin(event.target.value)} inputMode="numeric" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="add-skill-max" className="text-xs">Макс</Label>
          <Input id="add-skill-max" value={scaleMax} onChange={(event) => setScaleMax(event.target.value)} inputMode="numeric" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="add-skill-step" className="text-xs">Шаг</Label>
          <Input id="add-skill-step" value={scaleStep} onChange={(event) => setScaleStep(event.target.value)} inputMode="numeric" />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={isSaving}>
        <FilePlus2 /> Создать навык
      </Button>
    </form>
  );
}

function SkillInspectorPopover({ skill, isSaving, runAction }: { skill: SkillVm; isSaving: boolean; runAction: RunAction }) {
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [scaleMin, setScaleMin] = useState(String(skill.scaleMin));
  const [scaleMax, setScaleMax] = useState(String(skill.scaleMax));
  const [scaleStep, setScaleStep] = useState(String(skill.scaleStep));
  const [error, setError] = useState<string | null>(null);
  const [markValue, setMarkValue] = useState('');
  const [markLabel, setMarkLabel] = useState('');

  // Reset only when switching to a different skill — never mid-edit (would fight the debounce).
  useEffect(() => {
    setName(skill.name);
    setDescription(skill.description);
    setScaleMin(String(skill.scaleMin));
    setScaleMax(String(skill.scaleMax));
    setScaleStep(String(skill.scaleStep));
    setError(null);
  }, [skill.id]);

  function persistSkill() {
    let min: number;
    let max: number;
    let step: number;
    try {
      requireText(name, 'Название навыка');
      min = parseRequiredInt(scaleMin, 'Мин');
      max = parseRequiredInt(scaleMax, 'Макс');
      step = parseRequiredInt(scaleStep, 'Шаг');
      assertScaleBounds(min, max, step);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Некорректное значение');
      return;
    }
    setError(null);
    if (
      name.trim() === skill.name &&
      description === skill.description &&
      min === skill.scaleMin &&
      max === skill.scaleMax &&
      step === skill.scaleStep
    ) {
      return;
    }
    void runAction('Навык', () =>
      updateSkill({ id: skill.id, name: name.trim(), description, scaleMin: min, scaleMax: max, scaleStep: step }),
    );
  }

  useDebouncedSave([name, description, scaleMin, scaleMax, scaleStep], persistSkill);

  function addMark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAction('Метка шкалы', async () => {
      const value = parseRequiredInt(markValue, 'Mark value');
      assertScaleValue(value, skill.scaleMin, skill.scaleMax, skill.scaleStep, 'Значение метки');
      await createSkillScaleMark({
        skillId: skill.id,
        value,
        label: requireText(markLabel, 'Mark label'),
        description: '',
        sortOrder: undefined,
      });
      setMarkValue('');
      setMarkLabel('');
    });
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={(event) => event.stopPropagation()}>
              <SlidersHorizontal />
              <span className="sr-only">Редактировать {skill.name}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Шкала и детали · сохраняется автоматически</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" side="right" className="w-80" onClick={(event) => event.stopPropagation()}>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor={`insp-name-${skill.id}`}>Название навыка</Label>
            <Input id={`insp-name-${skill.id}`} value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`insp-desc-${skill.id}`}>Описание</Label>
            <Textarea id={`insp-desc-${skill.id}`} value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor={`insp-min-${skill.id}`} className="text-xs">Мин</Label>
              <Input id={`insp-min-${skill.id}`} value={scaleMin} onChange={(event) => setScaleMin(event.target.value)} inputMode="numeric" aria-invalid={Boolean(error)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`insp-max-${skill.id}`} className="text-xs">Макс</Label>
              <Input id={`insp-max-${skill.id}`} value={scaleMax} onChange={(event) => setScaleMax(event.target.value)} inputMode="numeric" aria-invalid={Boolean(error)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`insp-step-${skill.id}`} className="text-xs">Шаг</Label>
              <Input id={`insp-step-${skill.id}`} value={scaleStep} onChange={(event) => setScaleStep(event.target.value)} inputMode="numeric" aria-invalid={Boolean(error)} />
            </div>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <Separator className="my-3" />
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Уровни шкалы</span>
            <Badge variant="outline">{skill.marks.length}</Badge>
          </div>
          {skill.marks.length > 0 ? (
            <ul className="grid gap-1">
              {skill.marks.map((mark) => (
                <MarkRow key={mark.id} mark={mark} skill={skill} isSaving={isSaving} runAction={runAction} />
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Пока нет уровней.</p>
          )}
          <form className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-end gap-2" onSubmit={addMark}>
            <div className="grid gap-1.5">
              <Label htmlFor={`mark-val-${skill.id}`} className="text-xs">Значение</Label>
              <Input id={`mark-val-${skill.id}`} value={markValue} onChange={(event) => setMarkValue(event.target.value)} inputMode="numeric" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`mark-lbl-${skill.id}`} className="text-xs">Подпись</Label>
              <Input id={`mark-lbl-${skill.id}`} value={markLabel} onChange={(event) => setMarkLabel(event.target.value)} />
            </div>
            <Button type="submit" size="icon-sm" variant="outline" disabled={isSaving}>
              <Plus />
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MarkRow({ mark, skill, isSaving, runAction }: { mark: SkillVm['marks'][number]; skill: SkillVm; isSaving: boolean; runAction: RunAction }) {
  const [value, setValue] = useState(String(mark.value));
  const [label, setLabel] = useState(mark.label);

  useEffect(() => {
    setValue(String(mark.value));
    setLabel(mark.label);
  }, [mark.id]);

  const numeric = Number(value);
  const valueInvalid = value.trim() !== '' && !isScaleValue(numeric, skill.scaleMin, skill.scaleMax, skill.scaleStep);

  function persistMark() {
    if (!value.trim() || !label.trim() || valueInvalid) {
      return;
    }
    if (numeric === mark.value && label === mark.label) {
      return;
    }
    void runAction('Метка шкалы', () =>
      updateSkillScaleMark({
        id: mark.id,
        value: numeric,
        label: label.trim(),
        description: mark.description,
        sortOrder: mark.sortOrder,
      }),
    );
  }

  useDebouncedSave([value, label], persistMark);

  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value.replace(skill.scaleMin < 0 ? /[^0-9-]/g : /[^0-9]/g, ''))}
        inputMode="numeric"
        className="h-7"
        aria-invalid={valueInvalid}
        title={`Допустимо: ${skill.scaleMin}–${skill.scaleMax}${skill.scaleStep !== 1 ? `, шаг ${skill.scaleStep}` : ''}`}
      />
      <Input value={label} onChange={(event) => setLabel(event.target.value)} className="h-7" />
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={isSaving}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => void runAction('Удалить метку', () => deleteSkillScaleMark({ id: mark.id }))}
      >
        <Trash2 />
        <span className="sr-only">Удалить метку</span>
      </Button>
    </li>
  );
}
