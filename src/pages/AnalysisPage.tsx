import EmotionReport from '../components/EmotionReport';
import { useColorHistory } from '../hooks/useColorHistory';

export default function AnalysisPage() {
  const { records } = useColorHistory();

  return (
    <div className="page">
      <h1 className="page-title">감정 분석 🧠</h1>
      <EmotionReport records={records} />
    </div>
  );
}
