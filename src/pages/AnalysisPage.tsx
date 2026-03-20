import MemoWordCloud from '../components/MemoWordCloud';
import MemoInsights from '../components/MemoInsights';
import WeeklyAIReport from '../components/WeeklyAIReport';
import HueDotChart from '../components/HueDotChart';
import RadialHueMap from '../components/RadialHueMap';
import { useColorHistory } from '../hooks/useColorHistory';
import { useI18n } from '../i18n';

export default function AnalysisPage() {
  const { records } = useColorHistory();
  const { t } = useI18n();

  return (
    <div className="page analysis-page">
      <section className="analysis-section">
        <h3 className="analysis-section-title">{t.tabMemo || 'Memos'}</h3>
        <MemoWordCloud records={records} />
        <MemoInsights records={records} />
        <WeeklyAIReport records={records} />
      </section>

      <section className="analysis-section">
        <h3 className="analysis-section-title">{t.tabColor || 'Colors'}</h3>
        <div className="analysis-grid">
          <HueDotChart records={records} />
          <RadialHueMap records={records} />
        </div>
      </section>
    </div>
  );
}
