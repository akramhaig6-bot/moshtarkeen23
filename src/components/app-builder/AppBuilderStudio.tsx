// ═══════════════════════════════════════════════════════════════
// بيئة البناء (Builder Environment) — استوديو بناء تطبيق العميل
// 6 مناطق: شريط أدوات · شجرة · لوحة · خصائص · شريط حالة · لوحات عائمة
// التخطيط Mobile-First: على الهاتف تتحول الألواح الجانبية إلى Bottom
// Sheets مع شريط تبويبات سفلي، وتبقى كل الأوامر متاحة بضغطة واحدة.
// ═══════════════════════════════════════════════════════════════
import { AppProject } from '@/types/app-builder';
import { RuntimeData } from '@/lib/app-builder';
import { StudioProvider, useStudio, useStudioEngine } from '@/components/app-builder/studio-engine';
import {
  ActionEditorLayer, CanvasPane, ComponentsDrawer, DataDrawer, DesktopPropsAside, DesktopTreeAside,
  MobilePanels, MobileTabs, SelectionFloatingActions, StatusStrip, StructureSheets, StudioCompactBar,
  StudioTopBar, ToolsSheet,
} from '@/components/app-builder/studio/StudioPanels';
import {
  AppSettingsSheet, BarForm, DeleteSheet, ExitSheet, ModalForm, ModalLibrarySheet, PageForm, PreviewOverlay,
  PublishSheet, SitemapSheet,
} from '@/components/app-builder/studio/StudioDialogs';

export function AppBuilderStudio({
  initialProject, onSave, onExit, subscribers, runtimeData,
}: {
  initialProject: AppProject;
  onSave: (p: AppProject) => void;
  onExit: () => void;
  subscribers: { id: string; name: string }[];
  runtimeData: RuntimeData;
}) {
  const engine = useStudioEngine({ initialProject, onSave, onExit, subscribers, runtimeData });
  return (
    <StudioProvider value={engine}>
      <StudioShell />
    </StudioProvider>
  );
}

function StudioShell() {
  const st = useStudio();
  return (
    <div dir="rtl" className="builder-ui fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-hidden" data-testid="app-builder-studio">
      {/* ═══ [1] شريط الأدوات: نسخة الحاسوب الكاملة + نسخة مضغوطة للجوال ═══ */}
      <StudioTopBar />
      <StudioCompactBar />

      {/* ═══ الجسم: شجرة يمين · لوحة في الوسط · خصائص يسار (تتحول لألواح على الجوال) ═══ */}
      <div className="flex-1 flex min-h-0" onClick={() => st.setDropdown(null)}>
        <DesktopTreeAside />
        <CanvasPane />
        <DesktopPropsAside />
      </div>

      {/* ═══ [5] شريط الحالة — يبقى ظاهرًا على كل المقاسات ═══ */}
      <StatusStrip />

      {/* ═══ [6] شريط التبويبات السفلي (الجوال والتابلت) ═══ */}
      <MobileTabs />

      {/* ═══ الألواح العائمة والقوائم ═══ */}
      <ComponentsDrawer />
      <DataDrawer />
      <StructureSheets />
      <MobilePanels />
      <ToolsSheet />
      <SelectionFloatingActions />
      <ActionEditorLayer />

      {/* ═══ نوافذ الاستوديو (حوار/شيت) ═══ */}
      <PageForm />
      <BarForm />
      <ModalForm />
      <ModalLibrarySheet />
      <SitemapSheet />
      <AppSettingsSheet />
      <PreviewOverlay />
      <PublishSheet />
      <DeleteSheet />
      <ExitSheet />
    </div>
  );
}
