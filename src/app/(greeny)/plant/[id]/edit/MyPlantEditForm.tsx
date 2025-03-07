'use client';
import styles from './MyPlantEdit.module.scss';
import DatePicker from 'react-datepicker';
import Button from '@/components/button/Button';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useRef, useState } from 'react';
import { Controller, FormState, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import photoAdd from '@images/PhotoAddIcon.svg';
import plantData from '@/app/data/plantList';
import { PlantForm, PlantRes } from '@/types/plant';
import { format } from 'date-fns';
import { plantEdit, plantNew } from '@/app/api/actions/plantAction';
import useModal from '@/hooks/useModal';
const SERVER = process.env.NEXT_PUBLIC_API_SERVER;
const DBNAME = process.env.NEXT_PUBLIC_DB_NAME;

export default function MyPlantEditForm({ item }: { item: PlantRes }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(item.adoptionDate);
  const [drop, setDrop] = useState(false);
  const [plantName, setPlantName] = useState(item.scientificName);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { alert } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    formState,
    watch,
  } = useForm<PlantForm>({
    defaultValues: {
      name: item.name,
      content: item.content,
      introduction: item.introduction,
      light: item.light,
      grwhTp: item.grwhTp,
      humidity: item.humidity,
      waterCycle: item.waterCycle,
      adoptionDate: item.adoptionDate,
    },
  });

  //식물 사진 미리보기
  const [imagePreview, setImagePreview] = useState<string>(`${SERVER}${item.mainImages[0].path}`);
  const image = watch('attach');

  useEffect(() => {
    if (image && image.length > 0) {
      const file = image[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }, [image]);

  //식물 'name'
  const selectedPlantName = watch('scientificName');
  const selectedPlant = plantData.find((p) => p?.cntntsSj === plantName);

  useEffect(() => {
    if (selectedPlant) {
      setValue('light', selectedPlant.lighttdemanddoCodeNm || '');
      setValue('grwhTp', selectedPlant.grwhTpCodeNm || '');
      setValue('humidity', selectedPlant.hdCodeNm || '');
      setValue('waterCycle', Number(selectedPlant.waterCycleDay) || 0);
    }
  }, [selectedPlantName, selectedPlant, setValue]);

  //드롭다운
  const handledrop = () => {
    setDrop(!drop);
  };

  const plantOptions = plantData.map((plant) => (
    <li
      key={plant.cntntsNo}
      onClick={() => {
        setPlantName(plant.cntntsSj);
        setValue('scientificName', plant.cntntsSj);
        setDrop(false);
      }}
      className={styles.dropItem}
    >
      {plant.cntntsSj}
    </li>
  ));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDrop(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  //데이터 패치
  const onEditPlant = async (formData: PlantForm) => {
    const { dirtyFields } = formState;
    try {
      const plantEditForm = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attach') {
          plantEditForm.append(key, value as string);
        }
      });

      if (dirtyFields.attach && formData.attach) {
        plantEditForm.append('attach', formData.attach[0]);

        const fileRes = await fetch(`${SERVER}/files`, {
          method: 'POST',
          headers: {
            'client-id': `${DBNAME}`,
          },
          body: plantEditForm,
        });

        if (!fileRes.ok) {
          throw new Error('파일 업로드 실패');
        }

        const fileData = await fileRes.json();

        plantEditForm.append('mainImages', JSON.stringify([{ path: fileData.item[0].path, name: fileData.item[0].name }]));
      } else {
        plantEditForm.append('mainImages', JSON.stringify(item.mainImages));
      }

      const res = await plantEdit(item._id, plantEditForm);

      if (res.ok) {
        await alert(`"${res.item.name}(이)가 조금 더 특별해졌어요! 새로운 모습으로 여러분을 맞이해요! 🌱💕"`);
        router.replace(`/plant/${item._id}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onEditPlant)}>
      <h1>나의 식물 수정</h1>

      <div className={styles.layout_wrapper}>
        <div className={styles.file_container}>
          <h3>
            식물 이미지<span>*</span>
          </h3>
          <label htmlFor="attach" className={styles.photoAdd}>
            <div className={styles.photo_cover}>
              {imagePreview ? <Image src={imagePreview} alt="프로필 사진 선택" fill sizes="100%" priority /> : <Image src={photoAdd} alt="프로필 사진 선택" fill sizes="100%" priority />}
              <input type="file" id="attach" {...register('attach')} />
            </div>
          </label>
        </div>

        <div className={styles.subLayout_wrapper}>
          <div className={styles.input_container}>
            <label htmlFor="scientificName">
              식물<span>*</span>
            </label>
            <div className={styles.selectBox} ref={dropdownRef} onClick={handledrop}>
              {plantName}

              {drop ? <ul className={styles.select}>{plantOptions}</ul> : ''}
            </div>
            <input type="hidden" {...register('scientificName')} value={plantName} />
            {errors.scientificName && <p>{errors.scientificName.message}</p>}
          </div>

          <div className={styles.input_container}>
            <label htmlFor="info">가드닝 정보</label>
            <div className={styles.infoBox}>
              <div className={styles.infoItem}>
                <div className={styles.infoTit}>
                  <h4>습도</h4>
                  <span>|</span>
                </div>
                <input readOnly className={styles.readInput} type="text" {...register('humidity')} />
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoTit}>
                  <h4>온도</h4>
                  <span>|</span>
                </div>
                <input readOnly className={styles.readInput} type="text" {...register('grwhTp')} />
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoTit}>
                  <h4>일조량</h4>
                  <span>|</span>
                </div>
                <input readOnly className={styles.readInput} type="text" {...register('light')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.input_container} ${styles.type_flex}`}>
        <label htmlFor="name">
          식물 애칭<span>*</span>
        </label>
        <input
          type="text"
          id="name"
          placeholder="식물 애칭을 입력하세요."
          {...register('name', {
            required: '식물 애칭을 입력하세요.',
            minLength: {
              value: 2,
              message: '애칭을 2글자 이상 입력하세요.',
            },
          })}
        />
        {errors.name && <p>{errors.name?.message}</p>}
      </div>

      <div className={`${styles.input_container} ${styles.type_flex}`}>
        <label htmlFor="introduction">
          식물 소개<span>*</span>
        </label>
        <input
          type="text"
          id="introduction"
          placeholder="식물 소개를 입력하세요."
          {...register('introduction', {
            required: '식물 소개를 입력하세요.',
            minLength: {
              value: 2,
              message: '소개를 2글자 이상 입력하세요.',
            },
          })}
        />
        {errors.introduction && <p>{errors.introduction?.message}</p>}
      </div>

      <div className={`${styles.input_container} ${styles.type_flex}`}>
        <label htmlFor="adoptionDate">
          식물 입양일<span>*</span>
        </label>

        <Controller
          control={control}
          name="adoptionDate"
          rules={{ required: '입양 날짜를 선택해주세요.' }}
          render={({ field: { onChange } }) => (
            <DatePicker
              selected={selectedDate}
              dateFormat="yyyy.MM.dd"
              placeholderText="입양일을 선택해주세요."
              onChange={(date) => {
                setSelectedDate(date);
                onChange(date ? format(date, 'yyyy-MM-dd') : '');
              }}
            />
          )}
        />

        {errors.adoptionDate && <p>{errors.adoptionDate.message}</p>}
      </div>

      <div className={`${styles.input_container} ${styles.type_flex}`}>
        <label htmlFor="waterCycle">
          물주기<span>*</span>
        </label>
        <div className={styles.sub_container}>
          <input
            type="number"
            id="waterCycle"
            placeholder="물주기를 선택해주세요."
            {...register('waterCycle', {
              required: '물주기를 입력하세요.',
              pattern: {
                value: /^[0-9]*$/,
                message: '숫자만 입력 가능합니다.',
              },
            })}
          />
          <span>일에 한번씩</span>
        </div>
        {errors.waterCycle && <p>{errors.waterCycle.message}</p>}
      </div>

      <div className={`${styles.input_container} ${styles.type_flex}`}>
        <label htmlFor="content">
          특징<span>*</span>
        </label>
        <textarea
          id="content"
          placeholder="10글자 이상 적어주세요."
          {...register('content', {
            required: '식물의 특징을 적어주세요.',
            minLength: {
              value: 10,
              message: '특징을 10글자 이상 입력하세요.',
            },
          })}
        />
        {errors.content && <p>{errors.content.message}</p>}
      </div>

      <Button type="submit" bgColor="fill" btnSize="lg">
        식물 수정
      </Button>
    </form>
  );
}
