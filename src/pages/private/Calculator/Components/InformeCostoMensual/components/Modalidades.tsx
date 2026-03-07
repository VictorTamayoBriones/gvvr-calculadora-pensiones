import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeneralDataForm } from '@/models';
import { TablaRetoma } from './TablaRetoma';
import { TablaF100 } from './TablaF100';

interface ModalidadesProps {
  generalData: GeneralDataForm;
}

export function Modalidades({ generalData }: ModalidadesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalidades</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TablaRetoma generalData={generalData} />
          <TablaF100 generalData={generalData} />
        </div>
      </CardContent>
    </Card>
  );
}
